import { Module } from '@nestjs/common';
import { AirtableService } from './airtable.service';
import {ConfigModule} from "@nestjs/config";

@Module({
    imports: [ConfigModule],
    providers: [AirtableService],
    exports: [AirtableService],
})
export class AirtableModule {}