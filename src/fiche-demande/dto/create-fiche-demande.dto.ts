import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFicheDemandeDto {
  @ApiPropertyOptional({
    description: 'URL du document/fichier de la fiche (générée automatiquement lors de l\'upload)',
    example: 'https://raw.githubusercontent.com/owner/repo/main/1234567890_document.pdf',
  })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty({
    description: 'ID de la demande associée',
    example: 'uuid-demande',
  })
  @IsUUID()
  @IsString()
  id_demande: string;

  @ApiProperty({
    description: 'ID du personnel associé',
    example: 'uuid-personnel',
  })
  @IsUUID()
  @IsString()
  id_personnel: string;

  @ApiPropertyOptional({
    description: 'ID du service associé',
    example: 'uuid-service',
  })
  @IsUUID()
  @IsString()
  @IsOptional()
  id_service?: string;
}

