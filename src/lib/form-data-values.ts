type Props = {
  request: Request;
};

export async function formDataValues({ request }: Props) {
  const formData = await request.formData();
  return Object.fromEntries(formData);
}
