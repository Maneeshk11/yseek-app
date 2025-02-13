import { z } from "zod";
import { Input } from "./ui/input";
import { Form, FormControl, FormField, FormItem } from "./ui/form";
import { Company, SearchSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowUp } from "lucide-react";
import { Button } from "./ui/button";
import { Dispatch, FC, SetStateAction } from "react";
import axios from "axios";

interface SearchProps {
  setHasSearched: Dispatch<SetStateAction<boolean>>;
  setCompanies: Dispatch<SetStateAction<Company[]>>;
}

const SearchComponent: FC<SearchProps> = ({ setHasSearched, setCompanies }) => {
  const form = useForm<z.infer<typeof SearchSchema>>({
    resolver: zodResolver(SearchSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof SearchSchema>) => {
    setHasSearched(true);
    try {
      const res = await axios.post("/api/search", values, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setCompanies(res.data.response)
    } catch (error: any) {
      console.log("error fetching: ", error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex items-center group justify-between border-2 rounded-3xl border-orange-200 group-focus-within:border-orange-600 transition-colors"
      >
        <FormField
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Search"
                  className=" w-full sm:w-[34rem] p-6 border-0 focus:outline-none"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" variant={"ghost"} size="icon">
          <div className="rounded-full bg-orange-400 cursor-pointer p-2 hover:bg-orange-600">
            <ArrowUp className="text-white" />
          </div>
        </Button>
      </form>
    </Form>
  );
};

export default SearchComponent;
