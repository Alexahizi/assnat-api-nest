import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFicheDemandeDto {
  @ApiPropertyOptional({
    description: 'URL du document/fichier de la fiche',
    example: 'https://example.com/documents/fiche-demande-123.pdf',
  })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({
    description: 'ID du service associé',
    example: 'uuid-service',
  })
  @IsUUID()
  @IsString()
  @IsOptional()
  id_service?: string;
}

