import { HoneycombService } from "../modules/honeycomb/honeycomb.service";

const honeycombService = new HoneycombService();

function main() {
    try {
        honeycombService.createHoneycombProject("The Casino & The Church");
        console.log("Project created");
        honeycombService.createProfileTree();
        console.log("Profile tree created");
    } catch (error) {
        console.error(error);
    }
}

main();