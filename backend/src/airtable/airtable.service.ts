import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";

const Airtable = require('airtable');


@Injectable()
export class AirtableService {
    private base: any;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get('AIRTABLE_API_KEY');
        const baseId = this.configService.get('AIRTABLE_BASE_ID');

        Airtable.configure({apiKey});
        this.base = Airtable.base(baseId);
    }

    async getRecords(tableName: string, options?: any): Promise<any[]> {
        try {
            const records = await this.base(tableName).select(options).all();
            return Array.from(records);
        } catch (error) {
            throw new Error(`Failed to fetch records from ${tableName}: ${error.message}`);
        }
    }

    async getRecord(tableName: string, recordId: string): Promise<any> {
        try {
            return await this.base(tableName).find(recordId);
        } catch (error) {
            throw new Error(`Failed to fetch record ${recordId} from ${tableName}: ${error.message}`);
        }
    }

    async createRecord(tableName: string, fields: any): Promise<any> {
        try {
            return await this.base(tableName).create(fields);
        } catch (error) {
            throw new Error(`Failed to create record in ${tableName}: ${error.message}`);
        }
    }

    async updateRecord(tableName: string, recordId: string, fields: any): Promise<any> {
        try {
            return await this.base(tableName).update(recordId, fields);
        } catch (error) {
            throw new Error(`Failed to update record ${recordId} in ${tableName}: ${error.message}`);
        }
    }

    async deleteRecord(tableName: string, recordId: string): Promise<void> {
        try {
            await this.base(tableName).destroy(recordId);
        } catch (error) {
            throw new Error(`Failed to delete record ${recordId} from ${tableName}: ${error.message}`);
        }
    }
    async searchRecipes(query: string) {
        console.log(`Searching recipes with query: ${query}`);
        const records = await this.base('Recipes')
            .select({
                filterByFormula: `OR(
          SEARCH("${query}", LOWER({Name})),
          SEARCH("${query}", LOWER({Ingredients})),
        )`
            })
            .all();

        return records.map(record => ({
            id: record.id,
            ...record.fields
        }));
    }
}