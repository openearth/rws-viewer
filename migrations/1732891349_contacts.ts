import { Client } from "@datocms/cli/lib/cma-client-node";

export default async function (client: Client) {
  const itemTypes = await client.itemTypes.list();
  const menuItemType = itemTypes.find(
    (itemType: { api_key: string }) => itemType.api_key === "menu"
  ) || { id: "" };

  const fields = await client.fields.list(menuItemType.id);
  const findField = (label: string) =>
    fields.find((field: any) => field.label === label);

  const errorNotificationContactsField = findField(
    "Error notification contacts"
  );
  if (!errorNotificationContactsField) {
    console.log(
      'Create Multiple links field "Error notification contacts" (`error_notification_contacts`) in model "Menu" (`menu`)'
    );
    await client.fields.create(menuItemType.id, {
      id: "GlLvpmJFTBup26dDM2OMuQ",
      label: "Error notification contacts",
      field_type: "links",
      api_key: "error_notification_contacts",
      validators: {
        items_item_type: {
          on_publish_with_unpublished_references_strategy: "fail",
          on_reference_unpublish_strategy: "delete_references",
          on_reference_delete_strategy: "delete_references",
          item_types: [menuItemType.id],
        },
      },
      appearance: { addons: [], editor: "links_select", parameters: {} },
      default_value: null,
    });
  }

  const feedbackContactsField = findField("Feedback contacts");
  if (!feedbackContactsField) {
    console.log(
      'Create Multiple links field "Feedback contacts" (`feedback_contacts`) in model "Menu" (`menu`)'
    );
    await client.fields.create(menuItemType.id, {
      id: "CPxFkf5cRPKm0ORLakLX3Q",
      label: "Feedback contacts",
      field_type: "links",
      api_key: "feedback_contacts",
      validators: {
        items_item_type: {
          on_publish_with_unpublished_references_strategy: "fail",
          on_reference_unpublish_strategy: "delete_references",
          on_reference_delete_strategy: "delete_references",
          item_types: [menuItemType.id],
        },
      },
      appearance: { addons: [], editor: "links_select", parameters: {} },
      default_value: null,
    });
  }
}
