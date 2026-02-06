import { Injectable } from "@nestjs/common";
import { FAQ } from "@/src/utils/mock";

@Injectable()
export class GenericService {
  async faqs() {
    return FAQ;
  }
}
