import { z } from "zod";

const SearchSchema = z.object({
  prompt: z.string(),
});

const CompanySchema = z.object({
  name: z.string(),
  header: z.string(), 
  description: z.string(),
  tags: z.array(z.string()),
  logo_url: z.string()
})

export type Company = z.infer<typeof CompanySchema>


export {SearchSchema, CompanySchema};

