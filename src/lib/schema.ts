import { z } from "zod";

const SearchSchema = z.object({
  prompt: z.string(),
});


export {SearchSchema};
