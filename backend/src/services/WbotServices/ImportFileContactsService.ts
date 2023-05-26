import { head, has } from "lodash";
import XLSX from "xlsx";
import Contact from "../../models/Contact";
import CheckIsValidContact from "./CheckIsValidContact";
// import CheckContactNumber from "../WbotServices/CheckNumber";

export async function ImportFileContactsService(
  tenantId: number,
  file: Express.Multer.File | undefined
) {
  const workbook = XLSX.readFile(file?.path as string);
  const worksheet = head(Object.values(workbook.Sheets)) as any;
  const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 0 });
  const contacts: any = [];

  rows.forEach(row => {
    let name = "";
    let number = "";
    let email = "";

    if (has(row, "nome") || has(row, "Nome")) {
      name = row.nome || row.Nome;
    }

    if (
      has(row, "numero") ||
      has(row, "número") ||
      has(row, "Numero") ||
      has(row, "Número")
    ) {
      number = row.numero || row["número"] || row.Numero || row["Número"];
      number = `${number}`.replace(/\D/g, "");
    }

    if (
      has(row, "email") ||
      has(row, "e-mail") ||
      has(row, "Email") ||
      has(row, "E-mail")
    ) {
      email = row.email || row["e-mail"] || row.Email || row["E-mail"];
    }

    name = name || number;

    if (name && number && number.length >= 10) {
      contacts.push({ name, number, email, tenantId });
    }
  });

  const contactList: Contact[] = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const contact of contacts) {
    try {
      // eslint-disable-next-line no-await-in-loop
      // const waNumber = await CheckIsValidContact(
      //   `${contact.number}`,
      //   `${contact.tenantId}`
      // );

      // eslint-disable-next-line no-await-in-loop
      const [newContact, created] = await Contact.findOrCreate({
        where: {
          number: contact.number, // `${waNumber.user}`,
          tenantId: contact.tenantId
        },
        defaults: contact
      });

      if (created) {
        contactList.push(newContact);
      }
    } catch (error) {
      console.error(`Número não é uma conta válida ${contact.number}`);
    }
  }

  return contactList;
}
