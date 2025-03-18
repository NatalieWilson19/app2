import axios from "./axios";
import { ContactMailRequest, ContactNewsletterRequest } from "./typex2";
export function contactNewsletterSet(
  name: string,
  email: string,
  subscribe: boolean,
) {
  return axios.post<never>("/v2/contact/newsletter", {
    name,
    email,
    subscribe,
  } satisfies ContactNewsletterRequest);
}

export function contactMailSend(name: string, email: string, message: string) {
  return axios.post<never>("/v2/contact/email", {
    name,
    email,
    message,
  } satisfies ContactMailRequest);
}
