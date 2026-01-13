import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Logger,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FicheDemandeService } from './fiche-demande.service';
import { UploaderService } from '../shared/uploader/uploader.service';
import { CreateFicheDemandeDto } from './dto/create-fiche-demande.dto';
import { UpdateFicheDemandeDto } from './dto/update-fiche-demande.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';

@ApiTags('Fiche Demande')
@Controller('fiche-demande')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FicheDemandeController {
  private readonly logger = new Logger(FicheDemandeController.name);

  constructor(
    private readonly ficheDemandeService: FicheDemandeService,
    private readonly uploaderService: UploaderService,
  ) {}

  // -----------------------------
  // Créer une fiche de demande avec upload de fichier
  // -----------------------------
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
      },
      fileFilter: (req, file, cb) => {
        // Accepter PDF et autres types de documents
        const allowedMimes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/png',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Type de fichier non autorisé. Formats acceptés: PDF, Word, JPEG, PNG'), false);
        }
      },
    }),
  )
  @Roles('EMPLOYE', 'CHEF_SERVICE', 'RH', 'ADMIN')
  @ApiOperation({ summary: 'Créer une nouvelle fiche de demande avec upload de fichier' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['id_demande', 'id_personnel', 'file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Fichier à uploader (PDF, Word, JPEG, PNG)',
        },
        id_demande: {
          type: 'string',
          format: 'uuid',
          description: 'ID de la demande associée',
          example: 'uuid-demande',
        },
        id_personnel: {
          type: 'string',
          format: 'uuid',
          description: 'ID du personnel associé',
          example: 'uuid-personnel',
        },
        id_service: {
          type: 'string',
          format: 'uuid',
          description: 'ID du service associé (optionnel)',
          example: 'uuid-service',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Fiche de demande créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides, fichier manquant ou fiche déjà existante' })
  @ApiResponse({ status: 404, description: 'Demande ou personnel non trouvé' })
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    this.logger.log('Création d\'une nouvelle fiche de demande avec upload de fichier');

    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    // Validation des champs requis
    if (!body.id_demande) {
      throw new BadRequestException('L\'ID de la demande est requis');
    }
    if (!body.id_personnel) {
      throw new BadRequestException('L\'ID du personnel est requis');
    }

    try {
      // Uploader le fichier et obtenir l'URL
      const url = await this.uploaderService.uploadFileToGitHubGeneric(file);
      this.logger.log(`Fichier uploadé avec succès: ${url}`);

      // Préparer les données pour la création
      const createFicheDemandeDto: CreateFicheDemandeDto = {
        id_demande: body.id_demande,
        id_personnel: body.id_personnel,
        id_service: body.id_service || undefined,
      };

      // Créer la fiche de demande avec l'URL
      const ficheDemande = await this.ficheDemandeService.create({
        ...createFicheDemandeDto,
        url,
      });

      return {
        ...ficheDemande,
        fileInfo: {
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
        },
      };
    } catch (error: any) {
      this.logger.error(`Erreur lors de la création de la fiche de demande: ${error.message}`);
      throw error;
    }
  }

  // -----------------------------
  // Récupérer toutes les fiches de demande
  // -----------------------------
  @Get()
  @Roles('RH', 'ADMIN')
  @ApiOperation({ summary: 'Récupérer toutes les fiches de demande' })
  @ApiResponse({ status: 200, description: 'Liste des fiches de demande' })
  findAll() {
    this.logger.log('Récupération de toutes les fiches de demande');
    return this.ficheDemandeService.findAll();
  }

  // -----------------------------
  // Récupérer une fiche de demande par ID
  // -----------------------------
  @Get(':id')
  @Roles('EMPLOYE', 'CHEF_SERVICE', 'RH', 'ADMIN')
  @ApiOperation({ summary: 'Récupérer une fiche de demande par ID' })
  @ApiResponse({ status: 200, description: 'Fiche de demande trouvée' })
  @ApiResponse({ status: 404, description: 'Fiche de demande non trouvée' })
  findOne(@Param('id') id: string) {
    this.logger.log(`Récupération de la fiche de demande ${id}`);
    return this.ficheDemandeService.findOne(id);
  }

  // -----------------------------
  // Récupérer une fiche de demande par ID de demande
  // -----------------------------
  @Get('demande/:id_demande')
  @Roles('EMPLOYE', 'CHEF_SERVICE', 'RH', 'ADMIN')
  @ApiOperation({ summary: 'Récupérer une fiche de demande par ID de demande' })
  @ApiResponse({ status: 200, description: 'Fiche de demande trouvée' })
  @ApiResponse({ status: 404, description: 'Fiche de demande non trouvée' })
  findByDemandeId(@Param('id_demande') id_demande: string) {
    this.logger.log(`Récupération de la fiche de demande pour la demande ${id_demande}`);
    return this.ficheDemandeService.findByDemandeId(id_demande);
  }

  // -----------------------------
  // Récupérer les fiches de demande par ID de personnel
  // -----------------------------
  @Get('personnel/:id_personnel')
  @Roles('EMPLOYE', 'CHEF_SERVICE', 'RH', 'ADMIN')
  @ApiOperation({ summary: 'Récupérer les fiches de demande d\'un personnel' })
  @ApiResponse({ status: 200, description: 'Liste des fiches de demande du personnel' })
  findByPersonnelId(@Param('id_personnel') id_personnel: string) {
    this.logger.log(`Récupération des fiches de demande pour le personnel ${id_personnel}`);
    return this.ficheDemandeService.findByPersonnelId(id_personnel);
  }

  // -----------------------------
  // Mettre à jour une fiche de demande (avec ou sans nouveau fichier)
  // -----------------------------
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
      },
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/png',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Type de fichier non autorisé. Formats acceptés: PDF, Word, JPEG, PNG'), false);
        }
      },
    }),
  )
  @Roles('RH', 'ADMIN')
  @ApiOperation({ summary: 'Mettre à jour une fiche de demande (avec ou sans nouveau fichier)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Nouveau fichier à uploader (optionnel)',
        },
        id_service: {
          type: 'string',
          format: 'uuid',
          description: 'ID du service associé (optionnel)',
          example: 'uuid-service',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Fiche de demande mise à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Fiche de demande non trouvée' })
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateFicheDemandeDto: UpdateFicheDemandeDto,
  ) {
    this.logger.log(`Mise à jour de la fiche de demande ${id}`);

    // Si un nouveau fichier est fourni, l'uploader
    if (file) {
      try {
        const url = await this.uploaderService.uploadFileToGitHubGeneric(file);
        this.logger.log(`Nouveau fichier uploadé avec succès: ${url}`);
        updateFicheDemandeDto.url = url;
      } catch (error: any) {
        this.logger.error(`Erreur lors de l'upload du nouveau fichier: ${error.message}`);
        throw error;
      }
    }

    return this.ficheDemandeService.update(id, updateFicheDemandeDto);
  }

  // -----------------------------
  // Supprimer une fiche de demande
  // -----------------------------
  @Delete(':id')
  @Roles('RH', 'ADMIN')
  @ApiOperation({ summary: 'Supprimer une fiche de demande' })
  @ApiResponse({ status: 200, description: 'Fiche de demande supprimée avec succès' })
  @ApiResponse({ status: 404, description: 'Fiche de demande non trouvée' })
  remove(@Param('id') id: string) {
    this.logger.log(`Suppression de la fiche de demande ${id}`);
    return this.ficheDemandeService.remove(id);
  }
}

