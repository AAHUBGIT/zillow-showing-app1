import { formatDateLabel, formatDateTimeLabel } from "./date";
import {
  CommunicationActivity,
  CommunicationChannel,
  CommunicationDirection,
  CommunicationTemplate,
  Lead
} from "./types";

export const communicationChannelOptions: CommunicationChannel[] = ["text", "email", "call", "note"];
export const communicationDirectionOptions: CommunicationDirection[] = ["outbound", "inbound", "internal"];

const createdAt = "2026-04-27T12:00:00.000Z";

export function getCommunicationChannelLabel(channel: CommunicationChannel) {
  switch (channel) {
    case "text":
      return "Text";
    case "email":
      return "Email";
    case "call":
      return "Call";
    case "note":
      return "Note";
    default:
      return "Communication";
  }
}

export function getCommunicationDirectionLabel(direction: CommunicationDirection) {
  switch (direction) {
    case "outbound":
      return "Outbound";
    case "inbound":
      return "Inbound";
    case "internal":
      return "Internal";
    default:
      return "Activity";
  }
}

export function getDefaultCommunicationTemplates(userId = "system"): CommunicationTemplate[] {
  return [
    {
      id: "default-first-response",
      userId,
      name: "First response",
      channel: "text",
      subject: "",
      body:
        "Hi {{firstName}}, this is your showing coordinator. I saw your interest in {{propertyAddress}}. What time works best for a quick follow-up?",
      sortOrder: 0,
      createdAt,
      updatedAt: createdAt
    },
    {
      id: "default-showing-confirmation",
      userId,
      name: "Showing confirmation",
      channel: "text",
      subject: "",
      body:
        "Hi {{firstName}}, confirming your showing for {{propertyAddress}} on {{showingDateTime}}. Reply here if anything changes.",
      sortOrder: 1,
      createdAt,
      updatedAt: createdAt
    },
    {
      id: "default-showing-reminder",
      userId,
      name: "Showing reminder",
      channel: "text",
      subject: "",
      body:
        "Hi {{firstName}}, quick reminder about your showing for {{propertyAddress}} on {{showingDateTime}}. See you then.",
      sortOrder: 2,
      createdAt,
      updatedAt: createdAt
    },
    {
      id: "default-running-late",
      userId,
      name: "Running late",
      channel: "text",
      subject: "",
      body:
        "Hi {{firstName}}, I am running a few minutes late for {{propertyAddress}}. I will keep you updated and appreciate your patience.",
      sortOrder: 3,
      createdAt,
      updatedAt: createdAt
    },
    {
      id: "default-post-tour-follow-up",
      userId,
      name: "Post-tour follow-up",
      channel: "email",
      subject: "Following up on {{propertyAddress}}",
      body:
        "Hi {{firstName}},\n\nThanks for touring {{propertyAddress}}. What did you think of the space, pricing, and location? I can help compare it against your shortlist and next steps.\n\nBest,",
      sortOrder: 4,
      createdAt,
      updatedAt: createdAt
    },
    {
      id: "default-application-next-step",
      userId,
      name: "Application next step",
      channel: "email",
      subject: "Next step for {{propertyAddress}}",
      body:
        "Hi {{firstName}},\n\nIf you would like to move forward with {{propertyAddress}}, the next step is to complete the application and gather any requested income or ID documents. I can send the application link when you are ready.\n\nBest,",
      sortOrder: 5,
      createdAt,
      updatedAt: createdAt
    }
  ];
}

export function hydrateCommunicationText(value: string, lead: Lead) {
  const firstName = lead.fullName.split(" ").filter(Boolean)[0] || lead.fullName;
  const showingDateTime =
    lead.showingDate && lead.showingTime
      ? formatDateTimeLabel(lead.showingDate, lead.showingTime)
      : "a time we confirm together";

  return value
    .replaceAll("{{name}}", lead.fullName)
    .replaceAll("{{firstName}}", firstName)
    .replaceAll("{{phone}}", lead.phone)
    .replaceAll("{{email}}", lead.email)
    .replaceAll("{{propertyAddress}}", lead.propertyAddress)
    .replaceAll("{{desiredMoveInDate}}", formatDateLabel(lead.desiredMoveInDate))
    .replaceAll("{{showingDateTime}}", showingDateTime)
    .replaceAll("{{showingDate}}", lead.showingDate ? formatDateLabel(lead.showingDate) : "the showing date");
}

export function hydrateCommunicationTemplate(template: CommunicationTemplate, lead: Lead) {
  return {
    subject: hydrateCommunicationText(template.subject, lead),
    body: hydrateCommunicationText(template.body, lead)
  };
}

export function getDemoCommunicationActivities(lead: Lead): CommunicationActivity[] {
  const [firstTemplate, secondTemplate] = getDefaultCommunicationTemplates(lead.userId);
  const updatedAt = lead.updatedAt || lead.createdAt;
  const createdAtValue = lead.createdAt || updatedAt;

  return [
    {
      id: `${lead.id}-activity-1`,
      leadId: lead.id,
      userId: lead.userId,
      templateId: firstTemplate.id,
      channel: firstTemplate.channel,
      direction: "outbound",
      subject: hydrateCommunicationTemplate(firstTemplate, lead).subject,
      body: hydrateCommunicationTemplate(firstTemplate, lead).body,
      outcome: "Initial response sent.",
      occurredAt: createdAtValue,
      createdAt: createdAtValue
    },
    {
      id: `${lead.id}-activity-2`,
      leadId: lead.id,
      userId: lead.userId,
      templateId: secondTemplate.id,
      channel: secondTemplate.channel,
      direction: "outbound",
      subject: hydrateCommunicationTemplate(secondTemplate, lead).subject,
      body: hydrateCommunicationTemplate(secondTemplate, lead).body,
      outcome: lead.showingDate && lead.showingTime ? "Showing confirmation sent." : "Follow-up queued.",
      occurredAt: updatedAt,
      createdAt: updatedAt
    }
  ];
}
