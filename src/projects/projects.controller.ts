import { Controller, Get } from '@nestjs/common';

@Controller('projects')
export class ProjectsController {
    @Get()
    findAll() {
        return [
            {id: 1, name: "Site vitrine", client: "Dupont SARL", status: "in_progress"},
            {id: 2, name: "App mobile", client: "StartupXYZ", status: "done"},
        ]
    }
}
