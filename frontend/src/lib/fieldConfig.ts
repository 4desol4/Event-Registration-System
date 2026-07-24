import {
  Type,
  AlignLeft,
  Phone,
  Mail,
  Hash,
  ListChecks,
  CircleDot,
  CheckSquare,
  CircleHelp,
  Image as ImageIcon,
  Heading,
  LucideIcon,
} from "lucide-react";
import { FieldType } from "./types";

export const FIELD_TYPE_CONFIG: Record<
  FieldType,
  { label: string; icon: LucideIcon; hasOptions: boolean }
> = {
  text: { label: "Short Text", icon: Type, hasOptions: false },
  paragraph: { label: "Paragraph", icon: AlignLeft, hasOptions: false },
  phone: { label: "Phone Number", icon: Phone, hasOptions: false },
  email: { label: "Email Address", icon: Mail, hasOptions: false },
  number: { label: "Number", icon: Hash, hasOptions: false },
  select: { label: "Dropdown", icon: ListChecks, hasOptions: true },
  radio: { label: "Multiple Choice", icon: CircleDot, hasOptions: true },
  checkbox: { label: "Checkboxes", icon: CheckSquare, hasOptions: true },
  yes_no: {
    label: "Yes / No with Details",
    icon: CircleHelp,
    hasOptions: true,
  },
  image: { label: "Image / Banner", icon: ImageIcon, hasOptions: false },
  section_header: { label: "Section Header", icon: Heading, hasOptions: false },
};

export const FIELD_TYPE_ORDER: FieldType[] = [
  "text",
  "paragraph",
  "phone",
  "email",
  "number",
  "select",
  "radio",
  "checkbox",
  "yes_no",
  "section_header",
];

// Convenient pre-built field templates — mirrors the "quick add common field"
// idea from planning, so admins aren't building Phone/Email validation from scratch every time.
export const QUICK_ADD_PRESETS: {
  label: string;
  field: Partial<{
    label: string;
    type: FieldType;
    required: boolean;
    validation: { pattern: string; errorMessage: string };
    options: string[];
  }>;
}[] = [
  {
    label: "Full Name",
    field: { label: "Full Name", type: "text", required: true },
  },
  {
    label: "Phone Number",
    field: {
      label: "Phone Number",
      type: "phone",
      required: true,
      validation: {
        pattern: "^[0-9]{11}$",
        errorMessage: "Enter a valid 11-digit phone number",
      },
    },
  },
  {
    label: "Email Address",
    field: {
      label: "Email Address",
      type: "email",
      required: false,
      validation: {
        pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
        errorMessage: "Enter a valid email address",
      },
    },
  },
  {
    label: "Gender",
    field: {
      label: "Gender",
      type: "select",
      required: true,
      options: ["Male", "Female"],
    },
  },
  {
    label: "Age Bracket",
    field: {
      label: "Age Bracket",
      type: "select",
      required: true,
      options: ["Under 18", "18-25", "26-35", "36+"],
    },
  },
  {
    label: "LGA / State",
    field: { label: "LGA / State", type: "text", required: false },
  },
];
