import { Module } from '@nestjs/common';
import { GptService } from './ai.service';

@Module({
    providers: [GptService],
    exports: [GptService],
})
export class OpenaiModule {}