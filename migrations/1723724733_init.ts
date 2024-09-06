import type {
  Client,
  SimpleSchemaTypes,
} from "@datocms/cli/lib/cma-client-node";

export default async function (client: Client) {
  console.log("Configure new locales");
  client.site.update({
    locales: ["en", "nl"],
  });

  console.log("Creating/initializing new plugins");
  const pluginJsonTable = await client.plugins.create({
    package_name: "datocms-plugin-json-table",
  });

  const pluginModelDeploymentLinks = await client.plugins.create({
    package_name: "datocms-plugin-model-deployment-links",
  });

  const pluginWfs = await client.plugins.create({
    name: "WFS plugin",
    url: "https://datocms-wfs-plugin.netlify.app/",
  });

  const newFields: Record<string, SimpleSchemaTypes.Field> = {};
  const newFieldsets: Record<string, SimpleSchemaTypes.Fieldset> = {};
  const newItemTypes: Record<string, SimpleSchemaTypes.ItemType> = {};
  const newMenuItems: Record<string, SimpleSchemaTypes.MenuItem> = {};

  console.log("Create new models/block models");

  console.log('Create model "Layer" (`layer`)');
  newItemTypes["1518125"] = await client.itemTypes.create(
    {
      name: "Layer",
      api_key: "layer",
      all_locales_required: true,
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: "BQyZNdfQSaOED2NuiOe1-Q",
    }
  );

  console.log('Create model "Tag" (`tag`)');
  newItemTypes["1518135"] = await client.itemTypes.create(
    {
      name: "Tag",
      api_key: "tag",
      all_locales_required: true,
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: "F7-VgbIGR7C1AI-Ae1JXkA",
    }
  );

  console.log('Create model "Menu" (`menu`)');
  newItemTypes["1518226"] = await client.itemTypes.create(
    {
      name: "Menu",
      api_key: "menu",
      tree: true,
      all_locales_required: true,
      collection_appearance: "table",
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: "XJTAtuiLQdy7XBgrF4JqRA",
    }
  );

  console.log('Create block model "Menu Structure" (`menu_structure`)');
  newItemTypes["1518378"] = await client.itemTypes.create(
    {
      name: "Menu Structure",
      api_key: "menu_structure",
      modular_block: true,
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: "ENUcGyDdTLGQ_aQvnZgbfw",
    }
  );

  console.log('Create block model "Layer reference" (`layer_reference`)');
  newItemTypes["1518421"] = await client.itemTypes.create(
    {
      name: "Layer reference",
      api_key: "layer_reference",
      modular_block: true,
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: "U7aZpVynQ4WFCmYSq5y4rQ",
    }
  );

  console.log('Create model "App Config" (`app_config`)');
  newItemTypes["1554244"] = await client.itemTypes.create(
    {
      name: "App Config",
      singleton: true,
      api_key: "app_config",
      all_locales_required: true,
      collection_appearance: "table",
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: "bauXeDtQSP-UloLnmBb4cg",
    }
  );

  console.log('Create block model "Info" (`info`)');
  newItemTypes["1556541"] = await client.itemTypes.create(
    {
      name: "Info",
      api_key: "info",
      modular_block: true,
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: "cNF4fd2QThKE2EJ0yQT8fQ",
    }
  );

  console.log('Create block model "Info Item" (`info_item`)');
  newItemTypes["1556543"] = await client.itemTypes.create(
    {
      name: "Info Item",
      api_key: "info_item",
      modular_block: true,
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: "FHNNSytTRHaPzQ61JOCfdQ",
    }
  );

  console.log('Create model "External API" (`external_api`)');
  newItemTypes["1996329"] = await client.itemTypes.create(
    {
      name: "External API",
      api_key: "external_api",
      all_locales_required: true,
      collection_appearance: "table",
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: "ORgNDkbdTcGFAvYEBdNiJw",
    }
  );

  console.log('Create model "Factsheet" (`factsheet`)');
  newItemTypes["1998549"] = await client.itemTypes.create(
    {
      name: "Factsheet",
      api_key: "factsheet",
      all_locales_required: true,
      collection_appearance: "table",
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: "A1_bbFMxRz2x-qKhjigt6w",
    }
  );

  console.log('Create block model "Metadata Text Item" (`metadata_text_item`)');
  newItemTypes["1998668"] = await client.itemTypes.create(
    {
      name: "Metadata Text Item",
      api_key: "metadata_text_item",
      modular_block: true,
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: "eVsXJcfEScK5PyaJ0OpDuA",
    }
  );

  console.log('Create model "Inspire Dataset" (`inspire_dataset`)');
  newItemTypes["1998730"] = await client.itemTypes.create(
    {
      name: "Inspire Dataset",
      api_key: "inspire_dataset",
      all_locales_required: true,
      collection_appearance: "table",
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: "DiHtrf1dRUWfUkokX6kjLQ",
    }
  );

  console.log(
    'Create block model "Metadata Organisation" (`metadata_organisation`)'
  );
  newItemTypes["2000801"] = await client.itemTypes.create(
    {
      name: "Metadata Organisation",
      api_key: "metadata_organisation",
      modular_block: true,
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: "VRuXk5yyS2GBKimS2_tFkw",
    }
  );

  console.log('Create model "Viewer Config" (`viewer_config`)');
  newItemTypes["2019312"] = await client.itemTypes.create(
    {
      name: "Viewer Config",
      singleton: true,
      api_key: "viewer_config",
      all_locales_required: true,
      collection_appearance: "table",
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: "AnAxkIYvQVCK-2-0xfYd-A",
    }
  );

  console.log('Create block model "Topic Category" (`topic_category`)');
  newItemTypes["2022974"] = await client.itemTypes.create(
    {
      name: "Topic Category",
      api_key: "topic_category",
      modular_block: true,
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: "YldGg89fTT-uWmYd5NfE-Q",
    }
  );

  console.log('Create block model "Metadata Link" (`metadata_link`)');
  newItemTypes["2023063"] = await client.itemTypes.create(
    {
      name: "Metadata Link",
      api_key: "metadata_link",
      modular_block: true,
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: "OtuCelS9STi22eqDuL0ErQ",
    }
  );

  console.log('Create model "GeoNetwork" (`geonetwork`)');
  newItemTypes["2034324"] = await client.itemTypes.create(
    {
      name: "GeoNetwork",
      api_key: "geonetwork",
      all_locales_required: true,
      collection_appearance: "table",
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: "K1QaxkSdRo2kAq9BFFvCgQ",
    }
  );

  console.log('Create model "Contact" (`contact`)');
  newItemTypes["2034711"] = await client.itemTypes.create(
    {
      name: "Contact",
      api_key: "contact",
      all_locales_required: true,
      collection_appearance: "table",
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: "KNpqKSsNTiqNdmY-duPc8g",
    }
  );

  console.log('Create model "Viewer Layer" (`viewer_layer`)');
  await client.itemTypes.create(
    {
      id: "AZBPikJtQD6zem3SEFbUOg",
      name: "Viewer Layer",
      api_key: "viewer_layer",
      collection_appearance: "table",
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: "Pkuy_z3yQEagNWgigODmAA",
    }
  );

  console.log(
    'Create Single-line string field "Name" (`name`) in model "Layer" (`layer`)'
  );
  newFields["7581676"] = await client.fields.create(newItemTypes["1518125"], {
    label: "Name",
    field_type: "string",
    api_key: "name",
    localized: true,
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: { en: "", nl: "" },
  });

  console.log(
    'Create Single-line string field "Url" (`url`) in model "Layer" (`layer`)'
  );
  newFields["7581679"] = await client.fields.create(newItemTypes["1518125"], {
    label: "Url",
    field_type: "string",
    api_key: "url",
    hint: "Make sure the url doesn't end in a ? or / (just the host name).",
    validators: { required: {}, format: { predefined_pattern: "url" } },
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: "",
  });

  console.log(
    'Create Single-line string field "Layer" (`layer`) in model "Layer" (`layer`)'
  );
  newFields["7581678"] = await client.fields.create(newItemTypes["1518125"], {
    label: "Layer",
    field_type: "string",
    api_key: "layer",
    hint: "this should be including workspace name!",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: "",
  });

  console.log(
    'Create Multiple-paragraph text field "Description" (`description`) in model "Layer" (`layer`)'
  );
  newFields["10270437"] = await client.fields.create(newItemTypes["1518125"], {
    label: "Description",
    field_type: "text",
    api_key: "description",
    localized: true,
    appearance: {
      addons: [],
      editor: "wysiwyg",
      parameters: { toolbar: ["link"] },
      type: "wysiwyg",
    },
    default_value: { en: "", nl: "" },
  });

  console.log(
    'Create Single-line string field "Download URL" (`download_url`) in model "Layer" (`layer`)'
  );
  newFields["7581680"] = await client.fields.create(newItemTypes["1518125"], {
    label: "Download URL",
    field_type: "string",
    api_key: "download_url",
    hint: "Vul deze laag alleen in als er sprake is van het splitsen van een presentatielaag en laag om uit te downloaden (dit geld alleen als er afspraken zijn gemaakt met de data leverancier, er zijn immers 2 kaartlagen nodig, 1 met de locaties en 1 met de waarden)",
    validators: { format: { predefined_pattern: "url" } },
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: "",
  });

  console.log(
    'Create Single-line string field "Download Layer" (`download_layer`) in model "Layer" (`layer`)'
  );
  newFields["7581681"] = await client.fields.create(newItemTypes["1518125"], {
    label: "Download Layer",
    field_type: "string",
    api_key: "download_layer",
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: "",
  });

  console.log(
    'Create Boolean field "Time Filter" (`time_filter`) in model "Layer" (`layer`)'
  );
  newFields["9293868"] = await client.fields.create(newItemTypes["1518125"], {
    label: "Time Filter",
    field_type: "boolean",
    api_key: "time_filter",
    appearance: { addons: [], editor: "boolean", parameters: {} },
    default_value: false,
  });

  console.log(
    'Create JSON field "Column filter" (`column_filter`) in model "Layer" (`layer`)'
  );
  newFields["9293876"] = await client.fields.create(newItemTypes["1518125"], {
    label: "Column filter",
    field_type: "json",
    api_key: "column_filter",
    appearance: { addons: [], editor: "json", parameters: {} },
    default_value: null,
  });

  console.log('Create fieldset "i MENU inhoud" in model "Layer" (`layer`)');
  await client.fieldsets.create(newItemTypes["1518125"], {
    id: "fl8ztEqVSRGlgIkNPJ7Q6A",
    title: "i MENU inhoud",
    hint: "Hierin worden de 'wijzigbare onderdelen' van het i-menu ondergebracht. Diverse onderdelen van het i-menu worden automatisch gekoppeld tijdens het opvragen van het i-menu in de viewer.",
  });

  console.log(
    'Create Modular Content (Multiple blocks) field "Custom metadata" (`metadata`) in model "Layer" (`layer`)'
  );
  await client.fields.create(newItemTypes["1518125"], {
    id: "AnW00ZQ9SD24bxIA_Jsybw",
    label: "Custom metadata",
    field_type: "rich_text",
    api_key: "metadata",
    localized: true,
    validators: {
      rich_text_blocks: { item_types: [newItemTypes["1556543"].id] },
    },
    appearance: {
      addons: [],
      editor: "rich_text",
      parameters: { start_collapsed: false },
    },
    fieldset: { id: "fl8ztEqVSRGlgIkNPJ7Q6A", type: "fieldset" },
  });

  console.log(
    'Create Multiple-paragraph text field "Bron" (`bron`) in model "Layer" (`layer`)'
  );
  await client.fields.create(newItemTypes["1518125"], {
    id: "MST_hSw-RoCAnLWs8zG0lQ",
    label: "Bron",
    field_type: "text",
    api_key: "bron",
    localized: true,
    appearance: {
      addons: [],
      editor: "wysiwyg",
      parameters: { toolbar: ["link"] },
      type: "wysiwyg",
    },
    default_value: { en: "", nl: "" },
    fieldset: { id: "fl8ztEqVSRGlgIkNPJ7Q6A", type: "fieldset" },
  });
  console.log(
    'Create Multiple-paragraph text field "Info" (`info`) in model "Layer" (`layer`)'
  );
  await client.fields.create(newItemTypes["1518125"], {
    id: "AlZmC-hgTQit4j1Q2F5tiw",
    label: "Info",
    field_type: "text",
    api_key: "info",
    localized: true,
    appearance: {
      addons: [],
      editor: "wysiwyg",
      parameters: { toolbar: ["link"] },
      type: "wysiwyg",
    },
    default_value: { en: "", nl: "" },
    fieldset: { id: "fl8ztEqVSRGlgIkNPJ7Q6A", type: "fieldset" },
  });
  console.log(
    'Create Multiple-paragraph text field "Bijsluiter" (`bijsluiter`) in model "Layer" (`layer`)'
  );
  await client.fields.create(newItemTypes["1518125"], {
    id: "UScG4yk-TCa813E85W-apg",
    label: "Bijsluiter",
    field_type: "text",
    api_key: "bijsluiter",
    localized: true,
    appearance: {
      addons: [],
      editor: "wysiwyg",
      parameters: { toolbar: ["link"] },
      type: "wysiwyg",
    },
    default_value: { en: "", nl: "" },
    fieldset: { id: "fl8ztEqVSRGlgIkNPJ7Q6A", type: "fieldset" },
  });

  console.log(
    'Create Multiple links field "Tags" (`tags`) in model "Layer" (`layer`)'
  );
  newFields["7581704"] = await client.fields.create(newItemTypes["1518125"], {
    label: "Tags",
    field_type: "links",
    api_key: "tags",
    validators: {
      items_item_type: {
        on_publish_with_unpublished_references_strategy: "fail",
        on_reference_unpublish_strategy: "delete_references",
        on_reference_delete_strategy: "delete_references",
        item_types: [newItemTypes["1518135"].id],
      },
    },
    appearance: { addons: [], editor: "links_select", parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Multiple links field "External API" (`external_api`) in model "Layer" (`layer`)'
  );
  newFields["10126150"] = await client.fields.create(newItemTypes["1518125"], {
    label: "External API",
    field_type: "links",
    api_key: "external_api",
    validators: {
      items_item_type: {
        on_publish_with_unpublished_references_strategy: "fail",
        on_reference_unpublish_strategy: "delete_references",
        on_reference_delete_strategy: "delete_references",
        item_types: [newItemTypes["1996329"].id],
      },
    },
    appearance: { addons: [], editor: "links_embed", parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Asset gallery field "Thumbnails" (`thumbnails`) in model "Layer" (`layer`)'
  );
  newFields["10336525"] = await client.fields.create(newItemTypes["1518125"], {
    label: "Thumbnails",
    field_type: "gallery",
    api_key: "thumbnails",
    validators: { extension: { extensions: [], predefined_list: "image" } },
    appearance: { addons: [], editor: "gallery", parameters: {} },
    default_value: null,
  });

  console.log(
    'Create JSON field "Preview" (`preview`) in model "Layer" (`layer`)'
  );
  newFields["10253167"] = await client.fields.create(newItemTypes["1518125"], {
    label: "Preview",
    field_type: "json",
    api_key: "preview",
    appearance: {
      addons: [],
      editor: pluginModelDeploymentLinks.id,
      parameters: { urlPattern: "/api/layer?id={ id }&format=xml" },
    },
    default_value: null,
  });

  console.log(
    'Create JSON field "Indexable WFS properties" (`indexable_wfs_properties`) in model "Layer" (`layer`)'
  );
  newFields["10253264"] = await client.fields.create(newItemTypes["1518125"], {
    label: "Indexable WFS properties",
    field_type: "json",
    api_key: "indexable_wfs_properties",
    appearance: {
      addons: [],
      editor: pluginWfs.id,
      parameters: {},
      field_extension: "indexableWfsProperties",
    },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Title" (`title`) in model "Tag" (`tag`)'
  );
  newFields["7581702"] = await client.fields.create(newItemTypes["1518135"], {
    label: "Title",
    field_type: "string",
    api_key: "title",
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: "",
  });

  console.log(
    'Create Single-line string field "Name" (`name`) in model "Menu" (`menu`)'
  );
  newFields["7582166"] = await client.fields.create(newItemTypes["1518226"], {
    label: "Name",
    field_type: "string",
    api_key: "name",
    localized: true,
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: { en: "", nl: "" },
  });

  console.log(
    'Create Multiple links field "Viewer Layers" (`viewer_layers`) in model "Menu" (`menu`)'
  );
  await client.fields.create(newItemTypes["1518226"], {
    id: "Vshp8axkTSiqet07_sOcAw",
    label: "Viewer Layers",
    field_type: "links",
    api_key: "viewer_layers",
    validators: {
      items_item_type: {
        on_publish_with_unpublished_references_strategy: "fail",
        on_reference_unpublish_strategy: "delete_references",
        on_reference_delete_strategy: "delete_references",
        item_types: ["AZBPikJtQD6zem3SEFbUOg"],
      },
    },
    appearance: { addons: [], editor: "links_embed", parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Modular Content (Multiple blocks) field "Metadata" (`metadata`) in model "Menu" (`menu`)'
  );
  newFields["7788921"] = await client.fields.create(newItemTypes["1518226"], {
    label: "Metadata",
    field_type: "rich_text",
    api_key: "metadata",
    validators: {
      rich_text_blocks: { item_types: [newItemTypes["1556543"].id] },
    },
    appearance: {
      addons: [],
      editor: "rich_text",
      parameters: { start_collapsed: false },
    },
    default_value: null,
  });

  console.log(
    'Create Floating-point number field "Map Zoom" (`map_zoom`) in model "Menu" (`menu`)'
  );
  newFields["10315056"] = await client.fields.create(newItemTypes["1518226"], {
    label: "Map Zoom",
    field_type: "float",
    api_key: "map_zoom",
    appearance: {
      addons: [],
      editor: "float",
      parameters: { placeholder: null },
    },
    default_value: 7,
  });

  console.log(
    'Create JSON field "Map Center" (`map_center`) in model "Menu" (`menu`)'
  );
  newFields["10315088"] = await client.fields.create(newItemTypes["1518226"], {
    label: "Map Center",
    field_type: "json",
    api_key: "map_center",
    hint: "Lon, Lat in EPSG:4326",
    appearance: { addons: [], editor: "json", parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Single link field "Default layer" (`default_layer`) in model "Menu" (`menu`)'
  );
  newFields["10317618"] = await client.fields.create(newItemTypes["1518226"], {
    label: "Default layer",
    field_type: "link",
    api_key: "default_layer",
    hint: "Default layer to show on the viewer",
    validators: {
      item_item_type: {
        on_publish_with_unpublished_references_strategy: "fail",
        on_reference_unpublish_strategy: "delete_references",
        on_reference_delete_strategy: "delete_references",
        item_types: [newItemTypes["1518125"].id],
      },
    },
    appearance: { addons: [], editor: "link_select", parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Single link field "GeoNetwork" (`geonetwork`) in model "Menu" (`menu`)'
  );
  newFields["10435074"] = await client.fields.create(newItemTypes["1518226"], {
    label: "GeoNetwork",
    field_type: "link",
    api_key: "geonetwork",
    validators: {
      item_item_type: {
        on_publish_with_unpublished_references_strategy: "fail",
        on_reference_unpublish_strategy: "delete_references",
        on_reference_delete_strategy: "delete_references",
        item_types: [newItemTypes["2034324"].id],
      },
    },
    appearance: { addons: [], editor: "link_select", parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Multiple links field "Dead links report contacts" (`dead_links_report_contacts`) in model "Menu" (`menu`)'
  );
  newFields["10437913"] = await client.fields.create(newItemTypes["1518226"], {
    label: "Dead links report contacts",
    field_type: "links",
    api_key: "dead_links_report_contacts",
    validators: {
      items_item_type: {
        on_publish_with_unpublished_references_strategy: "fail",
        on_reference_unpublish_strategy: "delete_references",
        on_reference_delete_strategy: "delete_references",
        item_types: [newItemTypes["2034711"].id],
      },
    },
    appearance: { addons: [], editor: "links_select", parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Privacy statement" (`privacy_statement`) in model "Menu" (`menu`)'
  );
  newFields["8682855"] = await client.fields.create(newItemTypes["1518226"], {
    label: "Privacy statement",
    field_type: "string",
    api_key: "privacy_statement",
    validators: { format: { predefined_pattern: "url" } },
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: "",
  });

  console.log(
    'Create Multiple-paragraph text field "User agreement" (`user_agreement`) in model "Menu" (`menu`)'
  );
  newFields["8681472"] = await client.fields.create(newItemTypes["1518226"], {
    label: "User agreement",
    field_type: "text",
    api_key: "user_agreement",
    appearance: {
      addons: [],
      editor: "wysiwyg",
      parameters: {
        toolbar: [
          "format",
          "bold",
          "italic",
          "strikethrough",
          "ordered_list",
          "unordered_list",
          "quote",
          "link",
        ],
      },
      type: "wysiwyg",
    },
    default_value: "",
  });

  console.log(
    'Create Single-line string field "Piwik container id" (`piwik_container_id`) in model "Menu" (`menu`)'
  );
  newFields["13106229"] = await client.fields.create(newItemTypes["1518226"], {
    label: "Piwik container id",
    field_type: "string",
    api_key: "piwik_container_id",
    validators: { unique: {} },
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: "",
  });

  console.log(
    'Create Multiple-paragraph text field "Acknowledgments" (`acknowledgments`) in model "Menu" (`menu`)'
  );
  await client.fields.create(newItemTypes["1518226"], {
    id: "H7cTIWERTG-z24IE8ILCUw",
    label: "Acknowledgments",
    field_type: "text",
    api_key: "acknowledgments",
    localized: true,
    appearance: {
      addons: [],
      editor: "wysiwyg",
      parameters: { toolbar: ["link"] },
      type: "wysiwyg",
    },
    default_value: { en: "", nl: "" },
  });

  console.log('Create fieldset "i MENU inhoud" in model "Menu" (`menu`)');
  await client.fieldsets.create(newItemTypes["1518226"], {
    id: "bMDW38YXQ9K0I493NSD9ow",
    title: "i MENU inhoud",
    hint: "Hierin worden de 'wijzigbare onderdelen' van het i-menu ondergebracht. Diverse onderdelen van het i-menu worden automatisch gekoppeld tijdens het opvragen van het i-menu in de viewer.",
  });
  console.log(
    'Create Modular Content (Multiple blocks) field "Custom metadata" (`viewer_metadata`) in model "Menu" (`menu`)'
  );
  await client.fields.create(newItemTypes["1518226"], {
    id: "Mdo6gWiHREKoGwN3ndV2WQ",
    label: "Custom metadata",
    field_type: "rich_text",
    api_key: "viewer_metadata",
    localized: true,
    validators: {
      rich_text_blocks: { item_types: [newItemTypes["1556543"].id] },
    },
    appearance: {
      addons: [],
      editor: "rich_text",
      parameters: { start_collapsed: false },
    },
    fieldset: { id: "bMDW38YXQ9K0I493NSD9ow", type: "fieldset" },
  });
  console.log(
    'Create Multiple-paragraph text field "Bron" (`bron`) in model "Menu" (`menu`)'
  );
  await client.fields.create(newItemTypes["1518226"], {
    id: "OfiKgaT3SaWxmzi8moptGw",
    label: "Bron",
    field_type: "text",
    api_key: "bron",
    appearance: {
      addons: [],
      editor: "wysiwyg",
      parameters: { toolbar: ["link"] },
      type: "wysiwyg",
    },
    default_value: "",
    fieldset: { id: "bMDW38YXQ9K0I493NSD9ow", type: "fieldset" },
  });
  console.log(
    'Create Multiple-paragraph text field "Info" (`info`) in model "Menu" (`menu`)'
  );
  await client.fields.create(newItemTypes["1518226"], {
    id: "J-R7QQ_rQuKk32MSmezsgw",
    label: "Info",
    field_type: "text",
    api_key: "info",
    appearance: {
      addons: [],
      editor: "wysiwyg",
      parameters: { toolbar: ["link"] },
      type: "wysiwyg",
    },
    default_value: "",
    fieldset: { id: "bMDW38YXQ9K0I493NSD9ow", type: "fieldset" },
  });
  console.log(
    'Create Multiple-paragraph text field "Bijsluiter" (`bijsluiter`) in model "Menu" (`menu`)'
  );
  await client.fields.create(newItemTypes["1518226"], {
    id: "eioF30ylQJis-yFLvHwT1g",
    label: "Bijsluiter",
    field_type: "text",
    api_key: "bijsluiter",
    appearance: {
      addons: [],
      editor: "wysiwyg",
      parameters: { toolbar: ["link"] },
      type: "wysiwyg",
    },
    default_value: "",
    fieldset: { id: "bMDW38YXQ9K0I493NSD9ow", type: "fieldset" },
  });

  console.log(
    'Create Single-line string field "Title" (`title`) in block model "Menu Structure" (`menu_structure`)'
  );
  newFields["7583030"] = await client.fields.create(newItemTypes["1518378"], {
    label: "Title",
    field_type: "string",
    api_key: "title",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: "",
  });

  console.log(
    'Create Modular Content (Multiple blocks) field "Items" (`items`) in block model "Menu Structure" (`menu_structure`)'
  );
  newFields["7583223"] = await client.fields.create(newItemTypes["1518378"], {
    label: "Items",
    field_type: "rich_text",
    api_key: "items",
    validators: {
      rich_text_blocks: { item_types: [newItemTypes["1518378"].id] },
    },
    appearance: {
      addons: [],
      editor: "rich_text",
      parameters: { start_collapsed: false },
    },
    default_value: null,
  });

  console.log(
    'Create Multiple links field "Layers" (`layers`) in block model "Menu Structure" (`menu_structure`)'
  );
  newFields["7583227"] = await client.fields.create(newItemTypes["1518378"], {
    label: "Layers",
    field_type: "links",
    api_key: "layers",
    validators: {
      items_item_type: {
        on_publish_with_unpublished_references_strategy: "fail",
        on_reference_unpublish_strategy: "delete_references",
        on_reference_delete_strategy: "delete_references",
        item_types: [newItemTypes["1518125"].id],
      },
    },
    appearance: { addons: [], editor: "links_select", parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Single link field "layer" (`layer`) in block model "Layer reference" (`layer_reference`)'
  );
  newFields["7583225"] = await client.fields.create(newItemTypes["1518421"], {
    label: "layer",
    field_type: "link",
    api_key: "layer",
    validators: {
      item_item_type: {
        on_publish_with_unpublished_references_strategy: "fail",
        on_reference_unpublish_strategy: "delete_references",
        on_reference_delete_strategy: "delete_references",
        item_types: [newItemTypes["1518125"].id],
      },
      required: {},
    },
    appearance: { addons: [], editor: "link_select", parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Multiple links field "Categories" (`categories`) in model "App Config" (`app_config`)'
  );
  newFields["7776904"] = await client.fields.create(newItemTypes["1554244"], {
    label: "Categories",
    field_type: "links",
    api_key: "categories",
    validators: {
      items_item_type: {
        on_publish_with_unpublished_references_strategy: "fail",
        on_reference_unpublish_strategy: "delete_references",
        on_reference_delete_strategy: "delete_references",
        item_types: [newItemTypes["1518226"].id],
      },
    },
    appearance: { addons: [], editor: "links_select", parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Modular Content (Multiple blocks) field "Items" (`items`) in block model "Info" (`info`)'
  );
  newFields["7788917"] = await client.fields.create(newItemTypes["1556541"], {
    label: "Items",
    field_type: "rich_text",
    api_key: "items",
    validators: {
      rich_text_blocks: { item_types: [newItemTypes["1556543"].id] },
    },
    appearance: {
      addons: [],
      editor: "rich_text",
      parameters: { start_collapsed: false },
    },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Title" (`title`) in block model "Info Item" (`info_item`)'
  );
  newFields["7788907"] = await client.fields.create(newItemTypes["1556543"], {
    label: "Title",
    field_type: "string",
    api_key: "title",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: "",
  });

  console.log(
    'Create Multiple-paragraph text field "Content" (`content`) in block model "Info Item" (`info_item`)'
  );
  newFields["7788914"] = await client.fields.create(newItemTypes["1556543"], {
    label: "Content",
    field_type: "text",
    api_key: "content",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "wysiwyg",
      parameters: {
        toolbar: [
          "bold",
          "italic",
          "strikethrough",
          "ordered_list",
          "unordered_list",
          "link",
        ],
      },
      type: "wysiwyg",
    },
    default_value: "",
  });

  console.log(
    'Create Single-line string field "Name" (`name`) in model "External API" (`external_api`)'
  );
  newFields["10126138"] = await client.fields.create(newItemTypes["1996329"], {
    label: "Name",
    field_type: "string",
    api_key: "name",
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: "",
  });

  console.log(
    'Create Single-line string field "URL" (`url`) in model "External API" (`external_api`)'
  );
  newFields["10126144"] = await client.fields.create(newItemTypes["1996329"], {
    label: "URL",
    field_type: "string",
    api_key: "url",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: "",
  });

  console.log(
    'Create Single-line string field "API key env variable name" (`api_key`) in model "External API" (`external_api`)'
  );
  newFields["10126145"] = await client.fields.create(newItemTypes["1996329"], {
    label: "API key env variable name",
    field_type: "string",
    api_key: "api_key",
    hint: "Refers to the key of an environment variable configured in the application",
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: "",
  });

  console.log(
    'Create JSON field "Property mapping" (`property_mapping`) in model "External API" (`external_api`)'
  );
  newFields["10126147"] = await client.fields.create(newItemTypes["1996329"], {
    label: "Property mapping",
    field_type: "json",
    api_key: "property_mapping",
    hint: "Allowed values: area [mapping name for area in download request (eg.gebiedid)],  layerAttributeArea [attribute name of the map layer to be mapped to the area field], geojson [if used the download request will be send as a geojson as a filter]",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: pluginJsonTable.id,
      parameters: { addItem: true, requiredFields: "" },
      field_extension: "jsonTable",
    },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Filters" (`filters`) in model "External API" (`external_api`)'
  );
  newFields["10130139"] = await client.fields.create(newItemTypes["1996329"], {
    label: "Filters",
    field_type: "string",
    api_key: "filters",
    hint: "List of comma-separated filter keys",
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: "",
  });

  console.log(
    'Create Single-line string field "Date filters" (`date_filters`) in model "External API" (`external_api`)'
  );
  newFields["10136061"] = await client.fields.create(newItemTypes["1996329"], {
    label: "Date filters",
    field_type: "string",
    api_key: "date_filters",
    hint: "List of comma-separated datefilter keys ",
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: "",
  });

  console.log(
    'Create Boolean field "Format csv" (`format_csv`) in model "External API" (`external_api`)'
  );
  newFields["10136145"] = await client.fields.create(newItemTypes["1996329"], {
    label: "Format csv",
    field_type: "boolean",
    api_key: "format_csv",
    hint: "Can the filter format=csv be applied on this request",
    appearance: { addons: [], editor: "boolean", parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Max page size" (`max_page_size`) in model "External API" (`external_api`)'
  );
  newFields["10136149"] = await client.fields.create(newItemTypes["1996329"], {
    label: "Max page size",
    field_type: "string",
    api_key: "max_page_size",
    hint: "The max page size  of the request",
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: "",
  });

  console.log(
    'Create Modular Content (Multiple blocks) field "Layers" (`layers`) in model "External API" (`external_api`)'
  );
  newFields["10220503"] = await client.fields.create(newItemTypes["1996329"], {
    label: "Layers",
    field_type: "rich_text",
    api_key: "layers",
    validators: {
      rich_text_blocks: { item_types: [newItemTypes["1518421"].id] },
    },
    appearance: {
      addons: [],
      editor: "rich_text",
      parameters: { start_collapsed: false },
    },
    default_value: null,
  });

  console.log(
    'Create Boolean field "Freehand/rectangle drawing" (`freehand_rectangle_drawing`) in model "External API" (`external_api`)'
  );
  newFields["10220506"] = await client.fields.create(newItemTypes["1996329"], {
    label: "Freehand/rectangle drawing",
    field_type: "boolean",
    api_key: "freehand_rectangle_drawing",
    appearance: { addons: [], editor: "boolean", parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Boolean field "Point Selection" (`point_selection`) in model "External API" (`external_api`)'
  );
  newFields["10337321"] = await client.fields.create(newItemTypes["1996329"], {
    label: "Point Selection",
    field_type: "boolean",
    api_key: "point_selection",
    appearance: { addons: [], editor: "boolean", parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Boolean field "Multiple Selection" (`multiple_selection`) in model "External API" (`external_api`)'
  );
  newFields["10342044"] = await client.fields.create(newItemTypes["1996329"], {
    label: "Multiple Selection",
    field_type: "boolean",
    api_key: "multiple_selection",
    appearance: { addons: [], editor: "boolean", parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Boolean field "Selectable Layer" (`selectable_layer`) in model "External API" (`external_api`)'
  );
  await client.fields.create(newItemTypes["1996329"], {
    id: "A2ORc0fkRWuJzi7s40SS0g",
    label: "Selectable Layer",
    field_type: "boolean",
    api_key: "selectable_layer",
    hint: "Select this in case of a layer that is used to derive id's that are used in the call to the API.",
    appearance: { addons: [], editor: "boolean", parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Title" (`title`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10142169"] = await client.fields.create(newItemTypes["1998549"], {
    label: "Title",
    field_type: "string",
    api_key: "title",
    hint: "Only used inside the CMS for reference",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: "",
  });

  console.log(
    'Create Single-line string field "Titel/naam meet/monitorprogramma" (`titel_naam_meet_monitorprogramma`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10254684"] = await client.fields.create(newItemTypes["1998549"], {
    label: "Titel/naam meet/monitorprogramma",
    field_type: "string",
    api_key: "titel_naam_meet_monitorprogramma",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: "",
  });

  console.log(
    'Create Single-line string field "URL original file" (`url_original_file`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10142170"] = await client.fields.create(newItemTypes["1998549"], {
    label: "URL original file",
    field_type: "string",
    api_key: "url_original_file",
    validators: { format: { predefined_pattern: "url" } },
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: "",
  });

  console.log(
    'Create Multiple-paragraph text field "Naam aansturende organisatie" (`naam_aansturende_organisatie`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10158190"] = await client.fields.create(newItemTypes["1998549"], {
    label: "Naam aansturende organisatie",
    field_type: "text",
    api_key: "naam_aansturende_organisatie",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "textarea",
      parameters: { placeholder: null },
      type: "textarea",
    },
    default_value: "",
  });

  console.log(
    'Create Single-line string field "Datum voltooiing" (`datum_voltooiing`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10158191"] = await client.fields.create(newItemTypes["1998549"], {
    label: "Datum voltooiing",
    field_type: "string",
    api_key: "datum_voltooiing",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: "",
  });

  console.log(
    'Create Date field "Datum van de bron" (`datum_van_de_bron`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10334802"] = await client.fields.create(newItemTypes["1998549"], {
    label: "Datum van de bron",
    field_type: "date",
    api_key: "datum_van_de_bron",
    hint: "Op z\u2019n minst \u00E9\u00E9n van de elementen Datum creatie, Datum publicatie of Datum revisie is verplicht.\nhttps://geonovum.github.io/Metadata-ISO19115/#datum-van-de-bron",
    validators: { required: {} },
    appearance: { addons: [], editor: "date_picker", parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Datumtype van de bron" (`datumtype_van_de_bron`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10334803"] = await client.fields.create(newItemTypes["1998549"], {
    label: "Datumtype van de bron",
    field_type: "string",
    api_key: "datumtype_van_de_bron",
    hint: "Dit element bevat het type gebeurtenis waar de datum betrekking op heeft.\nhttps://geonovum.github.io/Metadata-ISO19115/#datum-type-van-de-bron",
    validators: {
      required: {},
      enum: { values: ["creation", "publication", "revision"] },
    },
    appearance: {
      addons: [],
      editor: "string_select",
      parameters: {
        options: [
          {
            hint: "Datum waarop de dataset of dataset serie is gecre\u00EBerd.",
            label: "Creation",
            value: "creation",
          },
          {
            hint: "Publicatie datum waarop de dataset of dataset serie is gepubliceerd.",
            label: "Publication",
            value: "publication",
          },
          {
            hint: "Datum waarop de dataset of dataset serie is gecontroleerd, verbeterd of is gewijzigd.",
            label: "Revision",
            value: "revision",
          },
        ],
      },
    },
    default_value: "publication",
  });

  console.log(
    'Create Multiple-paragraph text field "Samenvatting" (`samenvatting`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10254689"] = await client.fields.create(newItemTypes["1998549"], {
    label: "Samenvatting",
    field_type: "text",
    api_key: "samenvatting",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "markdown",
      parameters: { toolbar: [] },
      type: "markdown",
    },
    default_value: "",
  });

  console.log(
    'Create Single-line string field "Status" (`identificationinfo_status`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10335068"] = await client.fields.create(newItemTypes["1998549"], {
    label: "Status",
    field_type: "string",
    api_key: "identificationinfo_status",
    hint: "https://geonovum.github.io/Metadata-ISO19115/#status",
    validators: {
      required: {},
      enum: {
        values: [
          "completed",
          "historicalArchive",
          "obsolete",
          "onGoing",
          "planned",
          "required",
          "underDevelopment",
        ],
      },
    },
    appearance: {
      addons: [],
      editor: "string_select",
      parameters: {
        options: [
          {
            hint: "Productie van de data is compleet / afgerond.",
            label: "Completed",
            value: "completed",
          },
          {
            hint: "De data is opgeslagen in een offline opslagmedium.",
            label: "HistoricalArchive",
            value: "historicalArchive",
          },
          {
            hint: "Data is niet langer relevant.",
            label: "Obsolete",
            value: "obsolete",
          },
          {
            hint: "Data wordt continu geactualiseerd.",
            label: "OnGoing",
            value: "onGoing",
          },
          {
            hint: "Datum is al bekend wanneer de data gecre\u00EBerd of geactualiseerd moet zijn.",
            label: "Planned",
            value: "planned",
          },
          {
            hint: "Data moet nog gegenereerd of geactualiseerd worden.",
            label: "Required",
            value: "required",
          },
          {
            hint: "Data wordt momenteel gecre\u00EBerd.",
            label: "UnderDevelopment",
            value: "underDevelopment",
          },
        ],
      },
    },
    default_value: "completed",
  });

  console.log(
    'Create Multiple-paragraph text field "Doel waarvoor data worden verzameld" (`doel_waarvoor_data_worden_verzameld`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10158201"] = await client.fields.create(newItemTypes["1998549"], {
    label: "Doel waarvoor data worden verzameld",
    field_type: "text",
    api_key: "doel_waarvoor_data_worden_verzameld",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "textarea",
      parameters: { placeholder: null },
      type: "textarea",
    },
    default_value: "",
  });

  console.log(
    'Create Modular Content (Multiple blocks) field "Onderwerp" (`onderwerp`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10334806"] = await client.fields.create(newItemTypes["1998549"], {
    label: "Onderwerp",
    field_type: "rich_text",
    api_key: "onderwerp",
    validators: {
      rich_text_blocks: { item_types: [newItemTypes["2022974"].id] },
      size: { eq: 1 },
    },
    appearance: {
      addons: [],
      editor: "rich_text",
      parameters: { start_collapsed: false },
    },
    default_value: null,
  });

  console.log(
    'Create Multiple-paragraph text field "Naam uitvoerende dienst/organisatie" (`naam_uitvoerende_dienst_organisatie`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10158202"] = await client.fields.create(newItemTypes["1998549"], {
    label: "Naam uitvoerende dienst/organisatie",
    field_type: "text",
    api_key: "naam_uitvoerende_dienst_organisatie",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "textarea",
      parameters: { placeholder: null },
      type: "textarea",
    },
    default_value: "",
  });

  console.log(
    'Create Single-line string field "Rol contactpersoon" (`rol_contactpersoon`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10158203"] = await client.fields.create(newItemTypes["1998549"], {
    label: "Rol contactpersoon",
    field_type: "string",
    api_key: "rol_contactpersoon",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: "",
  });

  console.log(
    'Create Single-line string field "Geografisch gebied" (`geografisch_gebied`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10158204"] = await client.fields.create(newItemTypes["1998549"], {
    label: "Geografisch gebied",
    field_type: "string",
    api_key: "geografisch_gebied",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: "",
  });

  console.log(
    'Create Integer number field "Toepassingsschaal" (`toepassingsschaal`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10334822"] = await client.fields.create(newItemTypes["1998549"], {
    label: "Toepassingsschaal",
    field_type: "integer",
    api_key: "toepassingsschaal",
    hint: "https://geonovum.github.io/Metadata-ISO19115/#toepassingsschaal",
    appearance: {
      addons: [],
      editor: "integer",
      parameters: { placeholder: null },
    },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Hi\u00EBrarchieniveau" (`hierarchieniveau`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10335071"] = await client.fields.create(newItemTypes["1998549"], {
    label: "Hi\u00EBrarchieniveau",
    field_type: "string",
    api_key: "hierarchieniveau",
    validators: { required: {}, enum: { values: ["dataset", "series"] } },
    appearance: {
      addons: [],
      editor: "string_select",
      parameters: {
        options: [
          {
            hint: "Informatie heeft betrekking op de dataset.",
            label: "Dataset",
            value: "dataset",
          },
          {
            hint: "Informatie heeft betrekking op de serie.",
            label: "Series",
            value: "series",
          },
        ],
      },
    },
    default_value: "dataset",
  });

  console.log(
    'Create Multiple-paragraph text field "Gebruiksbeperkingen" (`gebruiksbeperkingen`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10158205"] = await client.fields.create(newItemTypes["1998549"], {
    label: "Gebruiksbeperkingen",
    field_type: "text",
    api_key: "gebruiksbeperkingen",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "textarea",
      parameters: { placeholder: null },
      type: "textarea",
    },
    default_value: "",
  });

  console.log(
    'Create Single-line string field "Juridische toegangsrestricties" (`juridische_toegangsrestricties`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10334820"] = await client.fields.create(newItemTypes["1998549"], {
    label: "Juridische toegangsrestricties",
    field_type: "string",
    api_key: "juridische_toegangsrestricties",
    hint: "https://geonovum.github.io/Metadata-ISO19115/#juridische-toegangsrestricties",
    validators: {
      required: {},
      enum: {
        values: [
          "copyright",
          "patent",
          "patentPending",
          "trademark",
          "license",
          "intellectualPropertyRights",
          "restricted",
          "otherRestrictions",
        ],
      },
    },
    appearance: {
      addons: [],
      editor: "string_select",
      parameters: {
        options: [
          {
            hint: "Exclusief recht voor publicatie, productie, of verkoop van rechten op een literair, theater, muzikaal of artistiek werk, of op het gebruik van een commerci\u00EBle druk of label, toegekend bij wet voor een specifieke periode of tijd aan een auteur, componist, artiest of distributeur.",
            label: "Copyright",
            value: "copyright",
          },
          {
            hint: "Overheid heeft een exclusief recht toegekend om een uitvinding te maken, verkopen, gebruiken of in licentie uit te geven.",
            label: "Patent",
            value: "patent",
          },
          {
            hint: "Geproduceerde of verkochte informatie wachtend op een patent.",
            label: "PatentPending",
            value: "patentPending",
          },
          {
            hint: "Een naam, symbool of ander object om een product te identificeren, wat officieel geregistreerd is en gebruik wettelijk voorbehouden is aan de eigenaar of fabrikant.",
            label: "Trademark",
            value: "trademark",
          },
          {
            hint: "Formele toestemming of iets te doen.",
            label: "License",
            value: "license",
          },
          {
            hint: "Recht op een financieel voordeel van en controle hebben op de distributie een niet tastbaar eigendom wat het resultaat is van creativiteit.",
            label: "IntellectualPropertyRights",
            value: "intellectualPropertyRights",
          },
          {
            hint: "Verbod op distributie en gebruik.",
            label: "Restricted",
            value: "restricted",
          },
          {
            hint: "Restrictie niet opgenomen in lijst.",
            label: "OtherRestrictions",
            value: "otherRestrictions",
          },
        ],
      },
    },
    default_value: "",
  });

  console.log(
    'Create Multiple-paragraph text field "Overige beperkingen in gebruik" (`overige_beperkingen_in_gebruik`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10158206"] = await client.fields.create(newItemTypes["1998549"], {
    label: "Overige beperkingen in gebruik",
    field_type: "text",
    api_key: "overige_beperkingen_in_gebruik",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "textarea",
      parameters: { placeholder: null },
      type: "textarea",
    },
    default_value: "",
  });

  console.log(
    'Create Modular Content (Multiple blocks) field "Themas" (`themas`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10254688"] = await client.fields.create(newItemTypes["1998549"], {
    label: "Themas",
    field_type: "rich_text",
    api_key: "themas",
    validators: {
      rich_text_blocks: { item_types: [newItemTypes["1998668"].id] },
      size: { min: 1 },
    },
    appearance: {
      addons: [],
      editor: "rich_text",
      parameters: { start_collapsed: false },
    },
    default_value: null,
  });

  console.log(
    'Create Multiple-paragraph text field "Temporele dekking" (`temporele_dekking`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10158207"] = await client.fields.create(newItemTypes["1998549"], {
    label: "Temporele dekking",
    field_type: "text",
    api_key: "temporele_dekking",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "textarea",
      parameters: { placeholder: null },
      type: "textarea",
    },
    default_value: "",
  });

  console.log(
    'Create Multiple-paragraph text field "Volledigheid" (`volledigheid`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10158209"] = await client.fields.create(newItemTypes["1998549"], {
    label: "Volledigheid",
    field_type: "text",
    api_key: "volledigheid",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "textarea",
      parameters: { placeholder: null },
      type: "textarea",
    },
    default_value: "",
  });

  console.log(
    'Create Multiple-paragraph text field "Nauwkeurigheid" (`nauwkeurigheid`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10158210"] = await client.fields.create(newItemTypes["1998549"], {
    label: "Nauwkeurigheid",
    field_type: "text",
    api_key: "nauwkeurigheid",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "textarea",
      parameters: { placeholder: null },
      type: "textarea",
    },
    default_value: "",
  });

  console.log(
    'Create Multiple-paragraph text field "Algemene beschrijving van herkomst " (`algemene_beschrijving_van_herkomst`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10158211"] = await client.fields.create(newItemTypes["1998549"], {
    label: "Algemene beschrijving van herkomst ",
    field_type: "text",
    api_key: "algemene_beschrijving_van_herkomst",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "textarea",
      parameters: { placeholder: null },
      type: "textarea",
    },
    default_value: "",
  });

  console.log(
    'Create Multiple-paragraph text field "Inwinningsmethode" (`inwinningsmethode`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10158212"] = await client.fields.create(newItemTypes["1998549"], {
    label: "Inwinningsmethode",
    field_type: "text",
    api_key: "inwinningsmethode",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "textarea",
      parameters: { placeholder: null },
      type: "textarea",
    },
    default_value: "",
  });

  console.log(
    'Create Multiple-paragraph text field "Beschrijving uitgevoerde bewerkingen " (`beschrijving_uitgevoerde_bewerkingen`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10158213"] = await client.fields.create(newItemTypes["1998549"], {
    label: "Beschrijving uitgevoerde bewerkingen ",
    field_type: "text",
    api_key: "beschrijving_uitgevoerde_bewerkingen",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "textarea",
      parameters: { placeholder: null },
      type: "textarea",
    },
    default_value: "",
  });

  console.log(
    'Create Single-line string field "Meetvariabelen" (`meetvariabelen`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10158214"] = await client.fields.create(newItemTypes["1998549"], {
    label: "Meetvariabelen",
    field_type: "string",
    api_key: "meetvariabelen",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: "",
  });

  console.log(
    'Create Multiple-paragraph text field "Meetmethodiek" (`meetmethodiek`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10158215"] = await client.fields.create(newItemTypes["1998549"], {
    label: "Meetmethodiek",
    field_type: "text",
    api_key: "meetmethodiek",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "textarea",
      parameters: { placeholder: null },
      type: "textarea",
    },
    default_value: "",
  });

  console.log(
    'Create Multiple-paragraph text field "Soort dataset" (`soort_dataset`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10158216"] = await client.fields.create(newItemTypes["1998549"], {
    label: "Soort dataset",
    field_type: "text",
    api_key: "soort_dataset",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "textarea",
      parameters: { placeholder: null },
      type: "textarea",
    },
    default_value: "",
  });

  console.log(
    'Create Multiple-paragraph text field "Verplichting vanuit (Europese) richtlijn" (`verplichting_vanuit_europese_richtlijn`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10158384"] = await client.fields.create(newItemTypes["1998549"], {
    label: "Verplichting vanuit (Europese) richtlijn",
    field_type: "text",
    api_key: "verplichting_vanuit_europese_richtlijn",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "wysiwyg",
      parameters: { toolbar: ["table"] },
      type: "wysiwyg",
    },
    default_value: "",
  });

  console.log(
    'Create Multiple-paragraph text field "Kosten op jaarbasis" (`kosten_op_jaarbasis`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10158385"] = await client.fields.create(newItemTypes["1998549"], {
    label: "Kosten op jaarbasis",
    field_type: "text",
    api_key: "kosten_op_jaarbasis",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "textarea",
      parameters: { placeholder: null },
      type: "textarea",
    },
    default_value: "",
  });

  console.log(
    'Create Multiple-paragraph text field "Soortenoverzicht" (`soortenoverzicht`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10158386"] = await client.fields.create(newItemTypes["1998549"], {
    label: "Soortenoverzicht",
    field_type: "text",
    api_key: "soortenoverzicht",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "textarea",
      parameters: { placeholder: null },
      type: "textarea",
    },
    default_value: "",
  });

  console.log(
    'Create Single-line string field "Habitats" (`habitats`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10254857"] = await client.fields.create(newItemTypes["1998549"], {
    label: "Habitats",
    field_type: "string",
    api_key: "habitats",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: "",
  });

  console.log(
    'Create Multiple-paragraph text field "Referenties" (`referenties`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10158388"] = await client.fields.create(newItemTypes["1998549"], {
    label: "Referenties",
    field_type: "text",
    api_key: "referenties",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "wysiwyg",
      parameters: { toolbar: ["unordered_list"] },
      type: "wysiwyg",
    },
    default_value: "",
  });

  console.log(
    'Create JSON field "Preview" (`preview`) in model "Factsheet" (`factsheet`)'
  );
  newFields["10159488"] = await client.fields.create(newItemTypes["1998549"], {
    label: "Preview",
    field_type: "json",
    api_key: "preview",
    localized: true,
    appearance: {
      addons: [],
      editor: pluginModelDeploymentLinks.id,
      parameters: { urlPattern: "/api/factsheet?id={ id }&format=html" },
    },
  });

  console.log(
    'Create Single-line string field "Title" (`title`) in block model "Metadata Text Item" (`metadata_text_item`)'
  );
  newFields["10142891"] = await client.fields.create(newItemTypes["1998668"], {
    label: "Title",
    field_type: "string",
    api_key: "title",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: "",
  });

  console.log(
    'Create fieldset "Informatie over de bron" in model "Inspire Dataset" (`inspire_dataset`)'
  );
  newFieldsets["560136"] = await client.fieldsets.create(
    newItemTypes["1998730"],
    { title: "Informatie over de bron" }
  );

  console.log(
    'Create fieldset "Trefwoorden" in model "Inspire Dataset" (`inspire_dataset`)'
  );
  newFieldsets["560134"] = await client.fieldsets.create(
    newItemTypes["1998730"],
    { title: "Trefwoorden" }
  );

  console.log(
    'Create fieldset "Beperkingen" in model "Inspire Dataset" (`inspire_dataset`)'
  );
  newFieldsets["560132"] = await client.fieldsets.create(
    newItemTypes["1998730"],
    { title: "Beperkingen" }
  );

  console.log(
    'Create fieldset "Ruimtelijke informatie bron" in model "Inspire Dataset" (`inspire_dataset`)'
  );
  newFieldsets["560133"] = await client.fieldsets.create(
    newItemTypes["1998730"],
    { title: "Ruimtelijke informatie bron" }
  );

  console.log(
    'Create fieldset "Informatie over de metadata" in model "Inspire Dataset" (`inspire_dataset`)'
  );
  newFieldsets["561206"] = await client.fieldsets.create(
    newItemTypes["1998730"],
    { title: "Informatie over de metadata" }
  );

  console.log(
    'Create Modular Content (Multiple blocks) field "Trefwoord" (`descriptivekeywords_keywords`) in model "Inspire Dataset" (`inspire_dataset`)'
  );
  newFields["10143360"] = await client.fields.create(newItemTypes["1998730"], {
    label: "Trefwoord",
    field_type: "rich_text",
    api_key: "descriptivekeywords_keywords",
    validators: {
      rich_text_blocks: { item_types: [newItemTypes["1998668"].id] },
      size: { min: 1 },
    },
    appearance: {
      addons: [],
      editor: "rich_text",
      parameters: { start_collapsed: true },
    },
    default_value: null,
    fieldset: newFieldsets["560134"],
  });

  console.log(
    'Create Single-line string field "Juridische toegangsrestricties" (`resourceconstraints_accessconstraints`) in model "Inspire Dataset" (`inspire_dataset`)'
  );
  newFields["10143362"] = await client.fields.create(newItemTypes["1998730"], {
    label: "Juridische toegangsrestricties",
    field_type: "string",
    api_key: "resourceconstraints_accessconstraints",
    hint: "https://geonovum.github.io/Metadata-ISO19115/#juridische-toegangsrestricties",
    validators: {
      required: {},
      enum: {
        values: [
          "copyright",
          "patent",
          "patentPending",
          "trademark",
          "license",
          "intellectualPropertyRights",
          "restricted",
          "otherRestrictions",
        ],
      },
    },
    appearance: {
      addons: [],
      editor: "string_select",
      parameters: {
        options: [
          {
            hint: "Exclusief recht voor publicatie, productie, of verkoop van rechten op een literair, theater, muzikaal of artistiek werk, of op het gebruik van een commerci\u00EBle druk of label, toegekend bij wet voor een specifieke periode of tijd aan een auteur, componist, artiest of distributeur.",
            label: "Copyright",
            value: "copyright",
          },
          {
            hint: "Overheid heeft een exclusief recht toegekend om een uitvinding te maken, verkopen, gebruiken of in licentie uit te geven.",
            label: "Patent",
            value: "patent",
          },
          {
            hint: "Geproduceerde of verkochte informatie wachtend op een patent.",
            label: "PatentPending",
            value: "patentPending",
          },
          {
            hint: "Een naam, symbool of ander object om een product te identificeren, wat officieel geregistreerd is en gebruik wettelijk voorbehouden is aan de eigenaar of fabrikant.",
            label: "Trademark",
            value: "trademark",
          },
          {
            hint: "Formele toestemming of iets te doen.",
            label: "License",
            value: "license",
          },
          {
            hint: "Recht op een financieel voordeel van en controle hebben op de distributie een niet tastbaar eigendom wat het resultaat is van creativiteit.",
            label: "IntellectualPropertyRights",
            value: "intellectualPropertyRights",
          },
          {
            hint: "Verbod op distributie en gebruik.",
            label: "Restricted",
            value: "restricted",
          },
          {
            hint: "Restrictie niet opgenomen in lijst.",
            label: "OtherRestrictions",
            value: "otherRestrictions",
          },
        ],
      },
    },
    default_value: "",
    fieldset: newFieldsets["560132"],
  });

  console.log(
    'Create Integer number field "Toepassingsschaal" (`spatialresolution_equivalentscale_denominator`) in model "Inspire Dataset" (`inspire_dataset`)'
  );
  newFields["10143365"] = await client.fields.create(newItemTypes["1998730"], {
    label: "Toepassingsschaal",
    field_type: "integer",
    api_key: "spatialresolution_equivalentscale_denominator",
    hint: "https://geonovum.github.io/Metadata-ISO19115/#toepassingsschaal",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "integer",
      parameters: { placeholder: null },
    },
    default_value: null,
    fieldset: newFieldsets["560133"],
  });

  console.log(
    'Create Single-line string field "Titel van de bron" (`citation_title`) in model "Inspire Dataset" (`inspire_dataset`)'
  );
  newFields["10143371"] = await client.fields.create(newItemTypes["1998730"], {
    label: "Titel van de bron",
    field_type: "string",
    api_key: "citation_title",
    hint: "Dit element dient om de naam van de dataset in vast te leggen.\nhttps://geonovum.github.io/Metadata-ISO19115/#titel-van-de-bron",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: "",
    fieldset: newFieldsets["560136"],
  });

  console.log(
    'Create Single-line string field "Hi\u00EBrarchieniveau" (`hierarchylevel`) in model "Inspire Dataset" (`inspire_dataset`)'
  );
  newFields["10162515"] = await client.fields.create(newItemTypes["1998730"], {
    label: "Hi\u00EBrarchieniveau",
    field_type: "string",
    api_key: "hierarchylevel",
    validators: { required: {}, enum: { values: ["dataset", "series"] } },
    appearance: {
      addons: [],
      editor: "string_select",
      parameters: {
        options: [
          {
            hint: "Informatie heeft betrekking op de dataset.",
            label: "Dataset",
            value: "dataset",
          },
          {
            hint: "Informatie heeft betrekking op de serie.",
            label: "Series",
            value: "series",
          },
        ],
      },
    },
    default_value: "dataset",
    fieldset: newFieldsets["561206"],
  });

  console.log(
    'Create Single-line string field "Gebruiksbeperkingen" (`resourceconstraints_uselimitation`) in model "Inspire Dataset" (`inspire_dataset`)'
  );
  newFields["10143361"] = await client.fields.create(newItemTypes["1998730"], {
    label: "Gebruiksbeperkingen",
    field_type: "string",
    api_key: "resourceconstraints_uselimitation",
    hint: "Dit element bevat toepassingen waarvoor de dataset niet geschikt is.\nhttps://geonovum.github.io/Metadata-ISO19115/#gebruiksbeperkingen",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: "",
    fieldset: newFieldsets["560132"],
  });

  console.log(
    'Create Single-line string field "Temporeel referentiesysteem" (`referencesystemidentifier_code`) in model "Inspire Dataset" (`inspire_dataset`)'
  );
  newFields["10143364"] = await client.fields.create(newItemTypes["1998730"], {
    label: "Temporeel referentiesysteem",
    field_type: "string",
    api_key: "referencesystemidentifier_code",
    hint: "https://geonovum.github.io/Metadata-ISO19115/#temporeel-referentiesysteem",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: "",
    fieldset: newFieldsets["560133"],
  });

  console.log(
    'Create Single-line string field "Datumtype van de bron" (`citation_date_datetype`) in model "Inspire Dataset" (`inspire_dataset`)'
  );
  newFields["10143370"] = await client.fields.create(newItemTypes["1998730"], {
    label: "Datumtype van de bron",
    field_type: "string",
    api_key: "citation_date_datetype",
    hint: "Dit element bevat het type gebeurtenis waar de datum betrekking op heeft.\nhttps://geonovum.github.io/Metadata-ISO19115/#datum-type-van-de-bron",
    validators: {
      required: {},
      enum: { values: ["creation", "publication", "revision"] },
    },
    appearance: {
      addons: [],
      editor: "string_select",
      parameters: {
        options: [
          {
            hint: "Datum waarop de dataset of dataset serie is gecre\u00EBerd.",
            label: "Creation",
            value: "creation",
          },
          {
            hint: "Publicatie datum waarop de dataset of dataset serie is gepubliceerd.",
            label: "Publication",
            value: "publication",
          },
          {
            hint: "Datum waarop de dataset of dataset serie is gecontroleerd, verbeterd of is gewijzigd.",
            label: "Revision",
            value: "revision",
          },
        ],
      },
    },
    default_value: "publication",
    fieldset: newFieldsets["560136"],
  });

  console.log(
    'Create Date field "Datum van de bron" (`citation_date_date`) in model "Inspire Dataset" (`inspire_dataset`)'
  );
  newFields["10143369"] = await client.fields.create(newItemTypes["1998730"], {
    label: "Datum van de bron",
    field_type: "date",
    api_key: "citation_date_date",
    hint: "Op z\u2019n minst \u00E9\u00E9n van de elementen Datum creatie, Datum publicatie of Datum revisie is verplicht.\nhttps://geonovum.github.io/Metadata-ISO19115/#datum-van-de-bron",
    validators: { required: {} },
    appearance: { addons: [], editor: "date_picker", parameters: {} },
    default_value: null,
    fieldset: newFieldsets["560136"],
  });

  console.log(
    'Create Multiple-paragraph text field "Samenvatting" (`abstract`) in model "Inspire Dataset" (`inspire_dataset`)'
  );
  newFields["10143368"] = await client.fields.create(newItemTypes["1998730"], {
    label: "Samenvatting",
    field_type: "text",
    api_key: "abstract",
    hint: "Dit element bevat een beschrijving van de inhoud van de dataset, geef in deze samenvatting  publieks vriendelijk informatie over de inhoud van de dataset.\nhttps://geonovum.github.io/Metadata-ISO19115/#samenvatting",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "textarea",
      parameters: { placeholder: null },
      type: "textarea",
    },
    default_value: "",
    fieldset: newFieldsets["560136"],
  });

  console.log(
    'Create Single-line string field "Status" (`identificationinfo_status`) in model "Inspire Dataset" (`inspire_dataset`)'
  );
  newFields["10162813"] = await client.fields.create(newItemTypes["1998730"], {
    label: "Status",
    field_type: "string",
    api_key: "identificationinfo_status",
    hint: "https://geonovum.github.io/Metadata-ISO19115/#status",
    validators: {
      required: {},
      enum: {
        values: [
          "completed",
          "historicalArchive",
          "obsolete",
          "onGoing",
          "planned",
          "required",
          "underDevelopment",
        ],
      },
    },
    appearance: {
      addons: [],
      editor: "string_select",
      parameters: {
        options: [
          {
            hint: "Productie van de data is compleet / afgerond.",
            label: "Completed",
            value: "completed",
          },
          {
            hint: "De data is opgeslagen in een offline opslagmedium.",
            label: "HistoricalArchive",
            value: "historicalArchive",
          },
          {
            hint: "Data is niet langer relevant.",
            label: "Obsolete",
            value: "obsolete",
          },
          {
            hint: "Data wordt continu geactualiseerd.",
            label: "OnGoing",
            value: "onGoing",
          },
          {
            hint: "Datum is al bekend wanneer de data gecre\u00EBerd of geactualiseerd moet zijn.",
            label: "Planned",
            value: "planned",
          },
          {
            hint: "Data moet nog gegenereerd of geactualiseerd worden.",
            label: "Required",
            value: "required",
          },
          {
            hint: "Data wordt momenteel gecre\u00EBerd.",
            label: "UnderDevelopment",
            value: "underDevelopment",
          },
        ],
      },
    },
    default_value: "completed",
    fieldset: newFieldsets["560136"],
  });

  console.log(
    'Create Modular Content (Multiple blocks) field "Onderwerp" (`topiccategories`) in model "Inspire Dataset" (`inspire_dataset`)'
  );
  newFields["10163089"] = await client.fields.create(newItemTypes["1998730"], {
    label: "Onderwerp",
    field_type: "rich_text",
    api_key: "topiccategories",
    validators: {
      rich_text_blocks: { item_types: [newItemTypes["2022974"].id] },
      size: { eq: 1 },
    },
    appearance: {
      addons: [],
      editor: "rich_text",
      parameters: { start_collapsed: false },
    },
    default_value: null,
    fieldset: newFieldsets["560136"],
  });

  console.log(
    'Create Multiple-paragraph text field "Algemene beschrijving herkomst" (`lineage_statement`) in model "Inspire Dataset" (`inspire_dataset`)'
  );
  newFields["10162665"] = await client.fields.create(newItemTypes["1998730"], {
    label: "Algemene beschrijving herkomst",
    field_type: "text",
    api_key: "lineage_statement",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "textarea",
      parameters: { placeholder: null },
      type: "textarea",
    },
    default_value: "",
  });

  console.log(
    'Create Multiple-paragraph text field "Organisation Name" (`organisation_name`) in block model "Metadata Organisation" (`metadata_organisation`)'
  );
  newFields["10160367"] = await client.fields.create(newItemTypes["2000801"], {
    label: "Organisation Name",
    field_type: "text",
    api_key: "organisation_name",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "textarea",
      parameters: { placeholder: null },
      type: "textarea",
    },
    default_value: "",
  });

  console.log(
    'Create Single-line string field "E-mail" (`email`) in block model "Metadata Organisation" (`metadata_organisation`)'
  );
  newFields["10343581"] = await client.fields.create(newItemTypes["2000801"], {
    label: "E-mail",
    field_type: "string",
    api_key: "email",
    validators: { required: {}, format: { predefined_pattern: "email" } },
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: "",
  });

  console.log(
    'Create Single-line string field "Rol" (`rol`) in block model "Metadata Organisation" (`metadata_organisation`)'
  );
  newFields["10160260"] = await client.fields.create(newItemTypes["2000801"], {
    label: "Rol",
    field_type: "string",
    api_key: "rol",
    validators: {
      required: {},
      enum: {
        values: [
          "resourceProvider",
          "custodian",
          "owner",
          "user",
          "distributor",
          "originator",
          "pointOfContact",
          "principalInvestigator",
          "processor",
          "publisher",
          "author",
        ],
      },
    },
    appearance: {
      addons: [],
      editor: "string_select",
      parameters: {
        options: [
          {
            hint: "Partij die de data verstrekt.",
            label: "ResourceProvider",
            value: "resourceProvider",
          },
          {
            hint: "Partij verantwoordelijk voor het beheer van de data.",
            label: "Custodian",
            value: "custodian",
          },
          {
            hint: "Partij die eigenaar is van de data.",
            label: "Owner",
            value: "owner",
          },
          {
            hint: "Partij die de data gebruikt.",
            label: "User",
            value: "user",
          },
          {
            hint: "Partij die de data verstrekt.",
            label: "Distributor",
            value: "distributor",
          },
          {
            hint: "Partij die de data heeft gecre\u00EBerd",
            label: "Originator",
            value: "originator",
          },
          {
            hint: "Partij die optreedt als contactpunt voor uitwisselen van kennis of verstrekking van de data.",
            label: "PointOfContact",
            value: "pointOfContact",
          },
          {
            hint: "Partij die betrokken was bij de uitvoering van onderzoek.",
            label: "PrincipalInvestigator",
            value: "principalInvestigator",
          },
          {
            hint: "Partij die de data heeft bewerkt, zodanig dat de data is gewijzigd.",
            label: "Processor",
            value: "processor",
          },
          {
            hint: "Partij die de data publiceert.",
            label: "Publisher",
            value: "publisher",
          },
          {
            hint: "Partij die auteur is van de data.",
            label: "Author",
            value: "author",
          },
        ],
      },
    },
    default_value: "",
  });

  console.log(
    'Create Single link field "Viewer" (`viewer`) in model "Viewer Config" (`viewer_config`)'
  );
  newFields["10315397"] = await client.fields.create(newItemTypes["2019312"], {
    label: "Viewer",
    field_type: "link",
    api_key: "viewer",
    validators: {
      item_item_type: {
        on_publish_with_unpublished_references_strategy: "fail",
        on_reference_unpublish_strategy: "delete_references",
        on_reference_delete_strategy: "delete_references",
        item_types: [newItemTypes["1518226"].id],
      },
    },
    appearance: { addons: [], editor: "link_select", parameters: {} },
    default_value: null,
  });

  console.log(
    'Create JSON field "Topic Category item" (`topic_category_item`) in block model "Topic Category" (`topic_category`)'
  );
  newFields["10343220"] = await client.fields.create(newItemTypes["2022974"], {
    label: "Topic Category item",
    field_type: "json",
    api_key: "topic_category_item",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "string_multi_select",
      parameters: {
        options: [
          {
            hint: "",
            label: "Landschappelijke waarden",
            value: "Landschappelijke waarden",
          },
          { hint: "", label: "Duisternis", value: "Duisternis" },
          { hint: "", label: "Rust", value: "Rust" },
          { hint: "", label: "Openheid", value: "Openheid" },
          { hint: "", label: "Biotisch", value: "Biotisch" },
          { hint: "", label: "Vogels", value: "Vogels" },
          { hint: "", label: "Zeezoogdieren", value: "Zeezoogdieren" },
          { hint: "", label: "Vissen", value: "Vissen" },
          { hint: "", label: "Fytoplankton", value: "Fytoplankton" },
          { hint: "", label: "Zooplankton", value: "Zooplankton" },
          { hint: "", label: "Kwelders", value: "Kwelders" },
          { hint: "", label: "Voedselweb", value: "Voedselweb" },
          { hint: "", label: "Waterbodem", value: "Waterbodem" },
          { hint: "", label: "Abiotisch", value: "Abiotisch" },
          { hint: "", label: "Morfologie", value: "Morfologie" },
          { hint: "", label: "Waterbeweging", value: "Waterbeweging" },
          { hint: "", label: "Kwelderhoogte", value: "Kwelderhoogte" },
          {
            hint: "",
            label: "Menselijke medegebruik",
            value: "Menselijke medegebruik",
          },
          {
            hint: "",
            label: "Wonen, werken, recreeren",
            value: "Wonen, werken, recreeren",
          },
        ],
      },
    },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Protocol" (`protocol`) in block model "Metadata Link" (`metadata_link`)'
  );
  newFields["10343002"] = await client.fields.create(newItemTypes["2023063"], {
    label: "Protocol",
    field_type: "string",
    api_key: "protocol",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "string_select",
      parameters: {
        options: [
          { hint: "", label: "ArcGIS REST Services", value: "ESRI:REST" },
          { hint: "", label: "OGC-WMS Web Map Service", value: "OGC:WMS" },
          {
            hint: "",
            label: "File for download",
            value: "WWW:DOWNLOAD-1.0-http--download",
          },
          {
            hint: "",
            label: "Web address (URL)",
            value: "WWW:LINK-1.0-http--link",
          },
        ],
      },
    },
    default_value: "",
  });

  console.log(
    'Create Single-line string field "URL" (`url`) in block model "Metadata Link" (`metadata_link`)'
  );
  newFields["10343003"] = await client.fields.create(newItemTypes["2023063"], {
    label: "URL",
    field_type: "string",
    api_key: "url",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: "",
  });

  console.log(
    'Create Single-line string field "Name" (`name`) in block model "Metadata Link" (`metadata_link`)'
  );
  newFields["10343005"] = await client.fields.create(newItemTypes["2023063"], {
    label: "Name",
    field_type: "string",
    api_key: "name",
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: "",
  });

  console.log(
    'Create Multiple-paragraph text field "Description" (`description`) in block model "Metadata Link" (`metadata_link`)'
  );
  newFields["10343099"] = await client.fields.create(newItemTypes["2023063"], {
    label: "Description",
    field_type: "text",
    api_key: "description",
    appearance: {
      addons: [],
      editor: "textarea",
      parameters: { placeholder: null },
      type: "textarea",
    },
    default_value: "",
  });

  console.log(
    'Create Single-line string field "Base URL" (`base_url`) in model "GeoNetwork" (`geonetwork`)'
  );
  newFields["10435069"] = await client.fields.create(newItemTypes["2034324"], {
    label: "Base URL",
    field_type: "string",
    api_key: "base_url",
    validators: { required: {}, format: { predefined_pattern: "url" } },
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: "",
  });

  console.log(
    'Create Single-line string field "Username" (`username`) in model "GeoNetwork" (`geonetwork`)'
  );
  newFields["10435070"] = await client.fields.create(newItemTypes["2034324"], {
    label: "Username",
    field_type: "string",
    api_key: "username",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: "",
  });

  console.log(
    'Create Single-line string field "Password" (`password`) in model "GeoNetwork" (`geonetwork`)'
  );
  newFields["10435072"] = await client.fields.create(newItemTypes["2034324"], {
    label: "Password",
    field_type: "string",
    api_key: "password",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: "",
  });

  console.log(
    'Create Single-line string field "Email" (`email`) in model "Contact" (`contact`)'
  );
  newFields["10437910"] = await client.fields.create(newItemTypes["2034711"], {
    label: "Email",
    field_type: "string",
    api_key: "email",
    localized: true,
    validators: {
      required: {},
      unique: {},
      format: { predefined_pattern: "email" },
    },
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: { en: "", nl: "" },
  });

  console.log(
    'Create fieldset "Metadata" in model "Viewer Layer" (`viewer_layer`)'
  );
  await client.fieldsets.create("AZBPikJtQD6zem3SEFbUOg", {
    id: "AsfH8MLbSuWNwKsK1iG6OQ",
    title: "Metadata",
  });

  console.log(
    'Create Single link field "Layer" (`layer`) in model "Viewer Layer" (`viewer_layer`)'
  );
  await client.fields.create("AZBPikJtQD6zem3SEFbUOg", {
    id: "C49FZ0DJQuqOqgb4cfSEfw",
    label: "Layer",
    field_type: "link",
    api_key: "layer",
    validators: {
      item_item_type: {
        on_publish_with_unpublished_references_strategy: "fail",
        on_reference_unpublish_strategy: "delete_references",
        on_reference_delete_strategy: "delete_references",
        item_types: [newItemTypes["1518125"].id],
      },
    },
    appearance: { addons: [], editor: "link_select", parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Boolean field "Use factsheet as metadata" (`use_factsheet_as_metadata`) in model "Viewer Layer" (`viewer_layer`)'
  );
  await client.fields.create("AZBPikJtQD6zem3SEFbUOg", {
    id: "SFMZ15rQT96BWMlk-oNTKw",
    label: "Use factsheet as metadata",
    field_type: "boolean",
    api_key: "use_factsheet_as_metadata",
    appearance: { addons: [], editor: "boolean", parameters: {} },
    default_value: null,
    fieldset: { id: "AsfH8MLbSuWNwKsK1iG6OQ", type: "fieldset" },
  });

  console.log(
    'Create Multiple links field "Factsheets" (`factsheets`) in model "Viewer Layer" (`viewer_layer`)'
  );
  await client.fields.create("AZBPikJtQD6zem3SEFbUOg", {
    id: "cdI3aQqZSm6KSDB7ZjYliA",
    label: "Factsheets",
    field_type: "links",
    api_key: "factsheets",
    validators: {
      items_item_type: {
        on_publish_with_unpublished_references_strategy: "fail",
        on_reference_unpublish_strategy: "delete_references",
        on_reference_delete_strategy: "delete_references",
        item_types: [newItemTypes["1998549"].id],
      },
      size: { max: 1 },
    },
    appearance: { addons: [], editor: "links_select", parameters: {} },
    default_value: null,
    fieldset: { id: "AsfH8MLbSuWNwKsK1iG6OQ", type: "fieldset" },
  });

  console.log(
    'Create Single link field "Inspire Metadata" (`inspire_metadata`) in model "Viewer Layer" (`viewer_layer`)'
  );
  await client.fields.create("AZBPikJtQD6zem3SEFbUOg", {
    id: "L2-PJwMoQYG8GvmMPHLfnw",
    label: "Inspire Metadata",
    field_type: "link",
    api_key: "inspire_metadata",
    validators: {
      item_item_type: {
        on_publish_with_unpublished_references_strategy: "fail",
        on_reference_unpublish_strategy: "delete_references",
        on_reference_delete_strategy: "delete_references",
        item_types: [newItemTypes["1998730"].id],
      },
    },
    appearance: { addons: [], editor: "link_select", parameters: {} },
    default_value: null,
    fieldset: { id: "AsfH8MLbSuWNwKsK1iG6OQ", type: "fieldset" },
  });

  console.log(
    'Create Modular Content (Multiple blocks) field "Links" (`links`) in model "Viewer Layer" (`viewer_layer`)'
  );
  await client.fields.create("AZBPikJtQD6zem3SEFbUOg", {
    id: "QMWqj9_vQTW9nDDsJNum3g",
    label: "Links",
    field_type: "rich_text",
    api_key: "links",
    localized: true,
    validators: {
      rich_text_blocks: { item_types: [newItemTypes["2023063"].id] },
    },
    appearance: {
      addons: [],
      editor: "rich_text",
      parameters: { start_collapsed: false },
    },
    fieldset: { id: "AsfH8MLbSuWNwKsK1iG6OQ", type: "fieldset" },
  });

  console.log(
    'Create Modular Content (Multiple blocks) field "Point of contact organisations" (`point_of_contact_organisations`) in model "Viewer Layer" (`viewer_layer`)'
  );
  await client.fields.create("AZBPikJtQD6zem3SEFbUOg", {
    id: "GBKyE8E-QG-TAoIl_3o2RQ",
    label: "Point of contact organisations",
    field_type: "rich_text",
    api_key: "point_of_contact_organisations",
    validators: {
      rich_text_blocks: { item_types: [newItemTypes["2000801"].id] },
    },
    appearance: {
      addons: [],
      editor: "rich_text",
      parameters: { start_collapsed: false },
    },
    default_value: null,
    fieldset: { id: "AsfH8MLbSuWNwKsK1iG6OQ", type: "fieldset" },
  });

  // console.log(
  //   'Create Single-line string field "Migration file name" (`name`) in model "Schema migration" (`schema_migration`)'
  // );
  // await client.fields.create("T496-TeNT4eiqlp7X0WDAQ", {
  //   id: "FyhdonTGQrKwZKp6ZH2DrA",
  //   label: "Migration file name",
  //   field_type: "string",
  //   api_key: "name",
  //   validators: { required: {} },
  //   appearance: {
  //     addons: [],
  //     editor: "single_line",
  //     parameters: { heading: false, placeholder: null },
  //   },
  //   default_value: "",
  // });

  console.log("Finalize models/block models");

  console.log('Update model "Layer" (`layer`)');
  await client.itemTypes.update(newItemTypes["1518125"], {
    title_field: newFields["7581676"],
  });

  console.log('Update model "Tag" (`tag`)');
  await client.itemTypes.update(newItemTypes["1518135"], {
    title_field: newFields["7581702"],
  });

  console.log('Update model "Menu" (`menu`)');
  await client.itemTypes.update(newItemTypes["1518226"], {
    title_field: newFields["7582166"],
    image_preview_field: newFields["10317618"],
  });

  console.log('Update model "External API" (`external_api`)');
  await client.itemTypes.update(newItemTypes["1996329"], {
    title_field: newFields["10126138"],
  });

  console.log('Update model "Factsheet" (`factsheet`)');
  await client.itemTypes.update(newItemTypes["1998549"], {
    title_field: newFields["10142169"],
  });

  console.log('Update model "Inspire Dataset" (`inspire_dataset`)');
  await client.itemTypes.update(newItemTypes["1998730"], {
    title_field: newFields["10143371"],
  });

  console.log('Update model "GeoNetwork" (`geonetwork`)');
  await client.itemTypes.update(newItemTypes["2034324"], {
    title_field: newFields["10435069"],
  });

  console.log('Update model "Contact" (`contact`)');
  await client.itemTypes.update(newItemTypes["2034711"], {
    title_field: newFields["10437910"],
  });

  console.log('Update model "Viewer Layer" (`viewer_layer`)');
  await client.itemTypes.update("AZBPikJtQD6zem3SEFbUOg", {
    title_field: { id: "C49FZ0DJQuqOqgb4cfSEfw", type: "field" },
    image_preview_field: { id: "C49FZ0DJQuqOqgb4cfSEfw", type: "field" },
  });

  console.log("Manage menu items");

  console.log('Create menu item "Layers"');
  newMenuItems["965009"] = await client.menuItems.create({
    label: "Layers",
    item_type: newItemTypes["1518125"],
  });

  console.log('Create menu item "Tags"');
  newMenuItems["965019"] = await client.menuItems.create({
    label: "Tags",
    item_type: newItemTypes["1518135"],
  });

  console.log('Create menu item "Viewers"');
  newMenuItems["965063"] = await client.menuItems.create({
    label: "Viewers",
    item_type: newItemTypes["1518226"],
  });

  console.log('Create menu item "External APIs"');
  newMenuItems["1237869"] = await client.menuItems.create({
    label: "External APIs",
    item_type: newItemTypes["1996329"],
  });

  console.log('Create menu item "Factsheets"');
  newMenuItems["1239297"] = await client.menuItems.create({
    label: "Factsheets",
    item_type: newItemTypes["1998549"],
  });

  console.log('Create menu item "INSPIRE Datasets"');
  newMenuItems["1239317"] = await client.menuItems.create({
    label: "INSPIRE Datasets",
    item_type: newItemTypes["1998730"],
    parent: { id: newMenuItems["1239297"].id, type: "menu_item" },
  });

  console.log('Create menu item "GeoNetwork"');
  newMenuItems["1261282"] = await client.menuItems.create({
    label: "GeoNetwork",
    item_type: newItemTypes["2034324"],
  });

  console.log('Create menu item "Contact"');
  newMenuItems["1261533"] = await client.menuItems.create({
    label: "Contact",
    item_type: newItemTypes["2034711"],
  });

  console.log('Update menu item "Viewers"');
  await client.menuItems.update(newMenuItems["965063"], { position: 1 });

  console.log('Update menu item "Layers"');
  await client.menuItems.update(newMenuItems["965009"], { position: 2 });

  console.log('Update menu item "Tags"');
  await client.menuItems.update(newMenuItems["965019"], { position: 3 });

  console.log('Update menu item "External APIs"');
  await client.menuItems.update(newMenuItems["1237869"], { position: 5 });

  console.log('Update menu item "GeoNetwork"');
  await client.menuItems.update(newMenuItems["1261282"], { position: 7 });

  console.log('Update menu item "Contact"');
  await client.menuItems.update(newMenuItems["1261533"], { position: 8 });

  console.log('Update menu item "INSPIRE Datasets"');
  await client.menuItems.update(newMenuItems["1239317"], { position: 0 });

  console.log('Update menu item "Factsheets"');
  await client.menuItems.update(newMenuItems["1239297"], { position: 6 });

  console.log("Manage schema menu items");

  console.log(
    'Update model schema menu item for model "Viewer Config" (`viewer_config`)'
  );
  await client.schemaMenuItems.update("AnAxkIYvQVCK-2-0xfYd-A", {
    position: 18,
  });

  console.log('Update model schema menu item for model "Tag" (`tag`)');
  await client.schemaMenuItems.update("F7-VgbIGR7C1AI-Ae1JXkA", {
    position: 16,
  });

  console.log('Update block schema menu item for block model "Info" (`info`)');
  await client.schemaMenuItems.update("cNF4fd2QThKE2EJ0yQT8fQ", {
    position: 6,
  });

  console.log(
    'Update block schema menu item for block model "Info Item" (`info_item`)'
  );
  await client.schemaMenuItems.update("FHNNSytTRHaPzQ61JOCfdQ", {
    position: 7,
  });

  console.log('Update model schema menu item for model "Menu" (`menu`)');
  await client.schemaMenuItems.update("XJTAtuiLQdy7XBgrF4JqRA", {
    position: 11,
  });
}
