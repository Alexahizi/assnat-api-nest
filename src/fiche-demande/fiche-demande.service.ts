import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { CreateFicheDemandeDto } from './dto/create-fiche-demande.dto';
import { UpdateFicheDemandeDto } from './dto/update-fiche-demande.dto';

@Injectable()
export class FicheDemandeService {
  private readonly logger = new Logger(FicheDemandeService.name);

  constructor(private prisma: PrismaService) {}

  // -----------------------------
  // Créer une fiche de demande
  // -----------------------------
  async create(dto: CreateFicheDemandeDto) {
    this.logger.log(`Création d'une fiche de demande pour la demande ${dto.id_demande}`);

    // Vérifier que la demande existe
    const demande = await this.prisma.demande.findUnique({
      where: { id_demande: dto.id_demande },
    });

    if (!demande) {
      throw new NotFoundException('Demande non trouvée');
    }

    // Vérifier que le personnel existe
    const personnel = await this.prisma.personnel.findUnique({
      where: { id_personnel: dto.id_personnel },
    });

    if (!personnel) {
      throw new NotFoundException('Personnel non trouvé');
    }

    // Vérifier si une fiche existe déjà pour cette demande
    const existingFiche = await this.prisma.ficheDemande.findUnique({
      where: { id_demande: dto.id_demande },
    });

    if (existingFiche) {
      throw new BadRequestException('Une fiche existe déjà pour cette demande');
    }

    // Vérifier le service si fourni
    if (dto.id_service) {
      const service = await this.prisma.service.findUnique({
        where: { id_service: dto.id_service },
      });

      if (!service) {
        throw new NotFoundException('Service non trouvé');
      }
    }

    // Créer la fiche de demande
    const ficheDemande = await this.prisma.ficheDemande.create({
      data: {
        url: dto.url,
        id_demande: dto.id_demande,
        id_personnel: dto.id_personnel,
        id_service: dto.id_service,
      },
      include: {
        demande: {
          include: {
            periodeConge: { include: { typeConge: true } },
            personnel: true,
            service: true,
          },
        },
        personnel: true,
        service: true,
      },
    });

    this.logger.log(`Fiche de demande créée: ${ficheDemande.id_fichedemande}`);
    return ficheDemande;
  }

  // -----------------------------
  // Récupérer toutes les fiches de demande
  // -----------------------------
  async findAll() {
    this.logger.log('Récupération de toutes les fiches de demande');
    return this.prisma.ficheDemande.findMany({
      include: {
        demande: {
          include: {
            periodeConge: { include: { typeConge: true } },
            personnel: true,
            service: true,
          },
        },
        personnel: true,
        service: true,
      },
      orderBy: { date_creation: 'desc' },
    });
  }

  // -----------------------------
  // Récupérer une fiche de demande par ID
  // -----------------------------
  async findOne(id: string) {
    this.logger.log(`Récupération de la fiche de demande ${id}`);

    const ficheDemande = await this.prisma.ficheDemande.findUnique({
      where: { id_fichedemande: id },
      include: {
        demande: {
          include: {
            periodeConge: { include: { typeConge: true } },
            personnel: true,
            service: true,
          },
        },
        personnel: true,
        service: true,
      },
    });

    if (!ficheDemande) {
      throw new NotFoundException('Fiche de demande non trouvée');
    }

    return ficheDemande;
  }

  // -----------------------------
  // Récupérer les fiches de demande par ID de demande
  // -----------------------------
  async findByDemandeId(id_demande: string) {
    this.logger.log(`Récupération de la fiche de demande pour la demande ${id_demande}`);

    const ficheDemande = await this.prisma.ficheDemande.findUnique({
      where: { id_demande },
      include: {
        demande: {
          include: {
            periodeConge: { include: { typeConge: true } },
            personnel: true,
            service: true,
          },
        },
        personnel: true,
        service: true,
      },
    });

    if (!ficheDemande) {
      throw new NotFoundException('Fiche de demande non trouvée pour cette demande');
    }

    return ficheDemande;
  }

  // -----------------------------
  // Récupérer les fiches de demande par ID de personnel
  // -----------------------------
  async findByPersonnelId(id_personnel: string) {
    this.logger.log(`Récupération des fiches de demande pour le personnel ${id_personnel}`);

    return this.prisma.ficheDemande.findMany({
      where: { id_personnel },
      include: {
        demande: {
          include: {
            periodeConge: { include: { typeConge: true } },
            personnel: true,
            service: true,
          },
        },
        personnel: true,
        service: true,
      },
      orderBy: { date_creation: 'desc' },
    });
  }

  // -----------------------------
  // Mettre à jour une fiche de demande
  // -----------------------------
  async update(id: string, dto: UpdateFicheDemandeDto) {
    this.logger.log(`Mise à jour de la fiche de demande ${id}`);

    // Vérifier que la fiche existe
    const existingFiche = await this.prisma.ficheDemande.findUnique({
      where: { id_fichedemande: id },
    });

    if (!existingFiche) {
      throw new NotFoundException('Fiche de demande non trouvée');
    }

    // Vérifier le service si fourni
    if (dto.id_service) {
      const service = await this.prisma.service.findUnique({
        where: { id_service: dto.id_service },
      });

      if (!service) {
        throw new NotFoundException('Service non trouvé');
      }
    }

    // Préparer les données à mettre à jour
    const updateData: any = {
      date_modification: new Date(),
    };

    if (dto.url !== undefined) {
      updateData.url = dto.url;
    }

    if (dto.id_service !== undefined) {
      updateData.id_service = dto.id_service;
    }

    // Mettre à jour la fiche
    const updatedFiche = await this.prisma.ficheDemande.update({
      where: { id_fichedemande: id },
      data: updateData,
      include: {
        demande: {
          include: {
            periodeConge: { include: { typeConge: true } },
            personnel: true,
            service: true,
          },
        },
        personnel: true,
        service: true,
      },
    });

    this.logger.log(`Fiche de demande mise à jour: ${updatedFiche.id_fichedemande}`);
    return updatedFiche;
  }

  // -----------------------------
  // Supprimer une fiche de demande
  // -----------------------------
  async remove(id: string) {
    this.logger.log(`Suppression de la fiche de demande ${id}`);

    const ficheDemande = await this.prisma.ficheDemande.findUnique({
      where: { id_fichedemande: id },
    });

    if (!ficheDemande) {
      throw new NotFoundException('Fiche de demande non trouvée');
    }

    await this.prisma.ficheDemande.delete({
      where: { id_fichedemande: id },
    });

    this.logger.log(`Fiche de demande supprimée: ${id}`);
    return { message: 'Fiche de demande supprimée avec succès' };
  }
}

