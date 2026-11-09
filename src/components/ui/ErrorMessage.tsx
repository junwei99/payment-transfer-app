import { FormNotice } from "@/components/ui/FormNotice";

export const ErrorMessage = ({ message }: { message: string }) => {
  return <FormNotice variant="error" message={message} />;
};
