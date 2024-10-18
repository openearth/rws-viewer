/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, SimpleSchemaTypes } from "@datocms/cli/lib/cma-client-node";

export default async function (client: Client) {
  const newFields: Record<string, SimpleSchemaTypes.Field> = {};
  const newFieldsets: Record<string, SimpleSchemaTypes.Fieldset> = {};

  console.log("Creating new fields/fieldsets");

  const fieldsets = await client.fieldsets.list("Liewx4sGRMCAGCch2TKjaA");
  const findFieldset = (title: string) =>
    fieldsets.find((fieldset: any) => fieldset.title === title);

  const fields = await client.fields.list("Liewx4sGRMCAGCch2TKjaA");
  const findField = (label: string) =>
    fields.find((field: any) => field.label === label);

  if (findFieldset("Informatie over de bron")) {
    console.log('Fieldset "Informatie over de bron" already exists');
  } else {
    console.log(
      'Create fieldset "Informatie over de bron" in model "Inspire Dataset" (`inspire_dataset`)'
    );
    newFieldsets["560136"] = await client.fieldsets.create(
      "Liewx4sGRMCAGCch2TKjaA",
      {
        title: "Informatie over de bron",
      }
    );
  }

  if (findFieldset("Verantwoordelijke organisatie bron")) {
    console.log('Fieldset "Verantwoordelijke organisatie bron" already exists');
  } else {
    console.log(
      'Create fieldset "Verantwoordelijke organisatie bron" in model "Inspire Dataset" (`inspire_dataset`)'
    );
    await client.fieldsets.create("Liewx4sGRMCAGCch2TKjaA", {
      id: "INy1cspgRTCwgrfVa2fTDw",
      title: "Verantwoordelijke organisatie bron",
      hint: "Gebruik de volledig uitgeschreven naam van de verantwoordelijke organisatie. De afkorting kan toegevoegd worden aan de organisatienaam. verantwoordelijke organisatie van de bron, bij voorkeur uri uit bijvoorbeeld http://standaarden.overheid.nl/owms/terms/Overheidsorganisatie.html",
    });
  }

  if (findFieldset("Trefwoorden")) {
    console.log('Fieldset "Trefwoorden" already exists');
  } else {
    console.log(
      'Create fieldset "Trefwoorden" in model "Inspire Dataset" (`inspire_dataset`)'
    );
    newFieldsets["560134"] = await client.fieldsets.create(
      "Liewx4sGRMCAGCch2TKjaA",
      {
        title: "Trefwoorden",
      }
    );
  }

  if (findFieldset("Beperkingen")) {
    console.log('Fieldset "Beperkingen" already exists');
  } else {
    console.log(
      'Create fieldset "Beperkingen" in model "Inspire Dataset" (`inspire_dataset`)'
    );
    newFieldsets["560132"] = await client.fieldsets.create(
      "Liewx4sGRMCAGCch2TKjaA",
      {
        title: "Beperkingen",
      }
    );
  }

  if (findFieldset("Ruimtelijke informatie bron")) {
    console.log('Fieldset "Ruimtelijke informatie bron" already exists');
  } else {
    console.log(
      'Create fieldset "Ruimtelijke informatie bron" in model "Inspire Dataset" (`inspire_dataset`)'
    );
    newFieldsets["560133"] = await client.fieldsets.create(
      "Liewx4sGRMCAGCch2TKjaA",
      {
        title: "Ruimtelijke informatie bron",
      }
    );
  }

  if (findFieldset("Kwaliteitsinformatie")) {
    console.log('Fieldset "Kwaliteitsinformatie" already exists');
  } else {
    console.log(
      'Create fieldset "Kwaliteitsinformatie" in model "Inspire Dataset" (`inspire_dataset`)'
    );
    await client.fieldsets.create("Liewx4sGRMCAGCch2TKjaA", {
      id: "TOSwC4esQFKcXNrW20gK1Q",
      title: "Kwaliteitsinformatie",
    });
  }

  if (findFieldset("Informatie over de metadata")) {
    console.log('Fieldset "Informatie over de metadata" already exists');
  } else {
    console.log(
      'Create fieldset "Informatie over de metadata" in model "Inspire Dataset" (`inspire_dataset`)'
    );
    newFieldsets["561206"] = await client.fieldsets.create(
      "Liewx4sGRMCAGCch2TKjaA",
      {
        title: "Informatie over de metadata",
      }
    );
  }

  if (findFieldset("Verantwoordelijke organisatie metadata")) {
    console.log(
      'Fieldset "Verantwoordelijke organisatie metadata" already exists'
    );
  } else {
    console.log(
      'Create fieldset "Verantwoordelijke organisatie metadata" in model "Inspire Dataset" (`inspire_dataset`)'
    );
    await client.fieldsets.create("Liewx4sGRMCAGCch2TKjaA", {
      id: "c4ZNV0cQTamwB4mBwbSFpg",
      title: "Verantwoordelijke organisatie metadata",
      hint: "Dit element bevat de naam van de organisatie verantwoordelijk voor de metadata.",
    });
  }

  if (findFieldset("Metadata standaard")) {
    console.log('Fieldset "Metadata standaard" already exists');
  } else {
    console.log(
      'Create fieldset "Metadata standaard" in model "Inspire Dataset" (`inspire_dataset`)'
    );
    await client.fieldsets.create("Liewx4sGRMCAGCch2TKjaA", {
      id: "d5CCVL3pSxGMdchqXBBQJQ",
      title: "Metadata standaard",
      hint: "De gehanteerde metadata standaard",
    });
  }

  if (findField("Trefwoord")) {
    console.log(
      'Field "Trefwoord" (`descriptivekeywords_keywords`) already exists'
    );
  } else {
    console.log(
      'Create Modular Content (Multiple blocks) field "Trefwoord" (`descriptivekeywords_keywords`) in model "Inspire Dataset" (`inspire_dataset`)'
    );
    newFields["10143360"] = await client.fields.create(
      "Liewx4sGRMCAGCch2TKjaA",
      {
        label: "Trefwoord",
        field_type: "rich_text",
        api_key: "descriptivekeywords_keywords",
        hint: 'Voor datasets en dataset series die betrekking hebben op INSPIRE dient het de relevante thema\u2019s te beschrijven zoals ze zijn gedefinieerd in annex I, II en III van de directive.  Zie ook <a href="https://docs.geostandaarden.nl/md/mdprofiel-iso19115/#trefwoord" target="_blank">ISO 19115 NL profiel</a>',
        validators: {
          rich_text_blocks: { item_types: ["VqJRRvRLQyy0_Vv5ybG3Ng"] },
          size: { min: 1 },
        },
        appearance: {
          addons: [],
          editor: "rich_text",
          parameters: { start_collapsed: true },
        },
        default_value: null,
      }
    );
  }

  if (findField("Juridische toegangsrestricties")) {
    console.log(
      'Field "Juridische toegangsrestricties" (`resourceconstraints_accessconstraints`) already exists'
    );
  } else {
    console.log(
      'Create Single-line string field "Juridische toegangsrestricties" (`resourceconstraints_accessconstraints`) in model "Inspire Dataset" (`inspire_dataset`)'
    );
    newFields["10143362"] = await client.fields.create(
      "Liewx4sGRMCAGCch2TKjaA",
      {
        label: "Juridische toegangsrestricties",
        field_type: "string",
        api_key: "resourceconstraints_accessconstraints",
        hint: 'Zie ook <a href="https://geonovum.github.io/Metadata-ISO19115/#juridische-toegangsrestricties" target="_blank">ISO 19115 NL profiel</a>',
        validators: { required: {} },
        appearance: {
          addons: [],
          editor: "string_select",
          parameters: {
            options: [
              {
                hint: "Exclusief recht voor publicatie, productie, of verkoop van rechten op een literair, theater, muzikaal of artistiek werk, of op het gebruik van een commerci\u00EBle druk of label, toegekend bij wet voor een specifieke periode of tijd aan een auteur, componist, artiest of distributeur.",
                label: "Copyright",
                value: "Copyright",
              },
              {
                hint: "Overheid heeft een exclusief recht toegekend om een uitvinding te maken, verkopen, gebruiken of in licentie uit te geven.",
                label: "Patent",
                value: "Patent",
              },
              {
                hint: "Geproduceerde of verkochte informatie wachtend op een patent.",
                label: "PatentPending",
                value: "PatentPending",
              },
              {
                hint: "Een naam, symbool of ander object om een product te identificeren, wat officieel geregistreerd is en gebruik wettelijk voorbehouden is aan de eigenaar of fabrikant.",
                label: "Trademark",
                value: "Trademark",
              },
              {
                hint: "Formele toestemming of iets te doen.",
                label: "License",
                value: "License",
              },
              {
                hint: "Recht op een financieel voordeel van en controle hebben op de distributie een niet tastbaar eigendom wat het resultaat is van creativiteit.",
                label: "IntellectualPropertyRights",
                value: "IntellectualPropertyRights",
              },
              {
                hint: "Verbod op distributie en gebruik.",
                label: "Restricted",
                value: "Restricted",
              },
              {
                hint: "Restrictie niet opgenomen in lijst.",
                label: "OtherRestrictions",
                value: "OtherRestrictions",
              },
            ],
          },
        },
        default_value: "Copyright",
      }
    );
  }

  if (findField("Titel van de bron")) {
    console.log('Field "Titel van de bron" (`citation_title`) already exists');
  } else {
    console.log(
      'Create Single-line string field "Titel van de bron" (`citation_title`) in model "Inspire Dataset" (`inspire_dataset`)'
    );
    newFields["10143371"] = await client.fields.create(
      "Liewx4sGRMCAGCch2TKjaA",
      {
        label: "Titel van de bron",
        field_type: "string",
        api_key: "citation_title",
        hint: 'Dit element dient om de naam van de dataset in vast te leggen. Zie ook <a href="https://geonovum.github.io/Metadata-ISO19115/#titel-van-de-bron" target="_blank">ISO 19115 NL profiel</a>\n',
        validators: { required: {} },
        appearance: {
          addons: [],
          editor: "single_line",
          parameters: { heading: false, placeholder: null },
        },
        default_value: "",
      }
    );
  }

  if (findField("Hiërarchieniveau")) {
    console.log('Field "Hiërarchieniveau" (`hierarchylevel`) already exists');
  } else {
    console.log(
      'Create Single-line string field "Hi\u00EBrarchieniveau" (`hierarchylevel`) in model "Inspire Dataset" (`inspire_dataset`)'
    );
    newFields["10162515"] = await client.fields.create(
      "Liewx4sGRMCAGCch2TKjaA",
      {
        label: "Hi\u00EBrarchieniveau",
        field_type: "string",
        api_key: "hierarchylevel",
        hint: 'Het element geeft aan waarop de metadata betrekking heeft, de dataset of dataset serie. Zie ook <a href="https://docs.geostandaarden.nl/md/mdprofiel-iso19115/#hi%C3%ABrarchieniveau" target="_blank">ISO 19115 NL profiel</a>',
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
      }
    );
  }

  if (findField("Niveau kwaliteitsbeschrijving")) {
    console.log(
      'Field "Niveau kwaliteitsbeschrijving" (`level`) already exists'
    );
  } else {
    console.log(
      'Create Single-line string field "Niveau kwaliteitsbeschrijving" (`level`) in model "Inspire Dataset" (`inspire_dataset`)'
    );
    await client.fields.create("Liewx4sGRMCAGCch2TKjaA", {
      id: "MciOlCyATDqKAeWCVthfgg",
      label: "Niveau kwaliteitsbeschrijving",
      field_type: "string",
      api_key: "level",
      hint: 'Dit element beschrijft het niveau waarop de kwaliteitsinformatie betrekking heeft. Zie ook <a href="https://docs.geostandaarden.nl/md/mdprofiel-iso19115/#niveau-kwaliteitsbeschrijving" target="_blank">ISO 19115 NL profiel</a>',
      appearance: {
        addons: [],
        editor: "string_select",
        parameters: {
          options: [
            {
              hint: "Informatie heeft betrekking op de dataset.",
              label: "dataset",
              value: "dataset",
            },
            {
              hint: "Informatie heeft betrekking op de serie.",
              label: "series",
              value: "series",
            },
          ],
        },
      },
      default_value: "",
    });
  }

  if (findField("Ruimtelijk schema")) {
    console.log(
      'Field "Ruimtelijk schema" (`md_spatialrepresentationtypecode`) already exists'
    );
  } else {
    console.log(
      'Create Single-line string field "Ruimtelijk schema" (`md_spatialrepresentationtypecode`) in model "Inspire Dataset" (`inspire_dataset`)'
    );
    await client.fields.create("Liewx4sGRMCAGCch2TKjaA", {
      id: "fFAppifMRJeYDqnflH6d8w",
      label: "Ruimtelijk schema",
      field_type: "string",
      api_key: "md_spatialrepresentationtypecode",
      hint: 'Dit element is conditioneel. Dit element is verplicht voor INSPIRE. Er dient een waarde uit de codelijst SpatialRepresentationType gebruikt te worden. Zie verder <a href="https://docs.geostandaarden.nl/md/mdprofiel-iso19115/#ruimtelijk-schema-van-de-bron" target="_blank"> ISO 19115 NL Profiel</a>',
      appearance: {
        addons: [],
        editor: "string_select",
        parameters: {
          options: [
            {
              hint: "Vector data wordt gebruikt om geografische data te representeren.",
              label: "vector",
              value: "vector",
            },
            {
              hint: "Grid data wordt gebruikt om geografische data te representeren",
              label: "grid",
              value: "grid",
            },
            {
              hint: "Tekstuele of tabel data wordt gebruikt om geografische data te representeren.",
              label: "textTable",
              value: "textTable",
            },
            {
              hint: "Triangulated irregular network",
              label: "tin",
              value: "tin",
            },
          ],
        },
      },
      default_value: "vector",
    });
  }

  if (findField("Organisatie")) {
    console.log('Field "Organisatie" (`organisationname`) already exists');
  } else {
    console.log(
      'Create Single-line string field "Organisatie" (`organisationname`) in model "Inspire Dataset" (`inspire_dataset`)'
    );
    await client.fields.create("Liewx4sGRMCAGCch2TKjaA", {
      id: "EToHPBiYTSOZ80SxmAWcpg",
      label: "Organisatie",
      field_type: "string",
      api_key: "organisationname",
      hint: 'Gebruik de volledig uitgeschreven naam van de verantwoordelijke organisatie. Zie ook <a href="https://docs.geostandaarden.nl/md/mdprofiel-iso19115/#Verantwoordelijke-organisatie-bron" target="_blank">ISO 19115 NL profiel</a>',
      appearance: {
        addons: [],
        editor: "single_line",
        parameters: { heading: false, placeholder: null },
      },
      default_value: "Rijkswaterstaat",
    });
  }

  if (findField("Gebruiksbeperkingen")) {
    console.log(
      'Field "Gebruiksbeperkingen" (`resourceconstraints_useconstraints`) already exists'
    );
  } else {
    console.log(
      'Create Single-line string field "Gebruiksbeperkingen" (`resourceconstraints_useconstraints`) in model "Inspire Dataset" (`inspire_dataset`)'
    );
    newFields["10143361"] = await client.fields.create(
      "Liewx4sGRMCAGCch2TKjaA",
      {
        label: "Gebruiksbeperkingen",
        field_type: "string",
        api_key: "resourceconstraints_useconstraints",
        hint: 'Dit element bevat toepassingen waarvoor de dataset niet geschikt is. Standaard waarde is geen gebruiks limitatie. \nZie ook <a href="https://geonovum.github.io/Metadata-ISO19115/#gebruiksbeperkingen" target="_blank">ISO 19115 NL profiel</a>',
        appearance: {
          addons: [],
          editor: "string_select",
          parameters: {
            options: [
              {
                hint: "",
                label: "Niet te gebruiken voor navigatie",
                value: "Niet te gebruiken voor navigatie",
              },
              {
                hint: "",
                label: "Geen gebruiks limitatie",
                value: "Geen gebruiks limitaties",
              },
            ],
          },
        },
        default_value: "Geen gebruiks limitaties",
      }
    );
  }

  if (findField("Datumtype van de bron")) {
    console.log(
      'Field "Datumtype van de bron" (`citation_date_datetype`) already exists'
    );
  } else {
    console.log(
      'Create Single-line string field "Datumtype van de bron" (`citation_date_datetype`) in model "Inspire Dataset" (`inspire_dataset`)'
    );
    newFields["10143370"] = await client.fields.create(
      "Liewx4sGRMCAGCch2TKjaA",
      {
        label: "Datumtype van de bron",
        field_type: "string",
        api_key: "citation_date_datetype",
        hint: 'Dit element bevat het type gebeurtenis waar de datum betrekking op heeft. Zie ook <a href="https://geonovum.github.io/Metadata-ISO19115/#datum-type-van-de-bron" target="_blank">ISO 19115 NL profiel</a>\n',
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
      }
    );
  }

  if (findField("Algemene beschrijving herkomst")) {
    console.log(
      'Field "Algemene beschrijving herkomst" (`lineage_statement`) already exists'
    );
  } else {
    console.log(
      'Create Multiple-paragraph text field "Algemene beschrijving herkomst" (`lineage_statement`) in model "Inspire Dataset" (`inspire_dataset`)'
    );
    newFields["10162665"] = await client.fields.create(
      "Liewx4sGRMCAGCch2TKjaA",
      {
        label: "Algemene beschrijving herkomst",
        field_type: "text",
        api_key: "lineage_statement",
        hint: 'Dit element beschrijft de proceshistorie. Zie ook <a href="https://geonovum.github.io/Metadata-ISO19115/#algemene-beschrijving-herkomst" target="_blank">ISO 19115 NL profiel</a>',
        validators: { required: {} },
        appearance: {
          addons: [],
          editor: "textarea",
          parameters: { placeholder: null },
          type: "textarea",
        },
        default_value: "",
      }
    );
  }

  if (findField("Links")) {
    console.log('Field "Links" (`links`) already exists');
  } else {
    console.log(
      'Create Modular Content (Multiple blocks) field "Links" (`links`) in model "Inspire Dataset" (`inspire_dataset`)'
    );
    newFields["11526998"] = await client.fields.create(
      "Liewx4sGRMCAGCch2TKjaA",
      {
        label: "Links",
        field_type: "rich_text",
        api_key: "links",
        validators: {
          rich_text_blocks: { item_types: ["IB2KUCI8RzKBHRc48YoHyA"] },
        },
        appearance: {
          addons: [],
          editor: "rich_text",
          parameters: { start_collapsed: false },
        },
        default_value: null,
      }
    );
  }

  if (findField("e-mail")) {
    console.log('Field "e-mail" (`electronicmailaddress`) already exists');
  } else {
    console.log(
      'Create Single-line string field "e-mail" (`electronicmailaddress`) in model "Inspire Dataset" (`inspire_dataset`)'
    );
    await client.fields.create("Liewx4sGRMCAGCch2TKjaA", {
      id: "NzxaGK5sSoyuErg9Tabo1Q",
      label: "e-mail",
      field_type: "string",
      api_key: "electronicmailaddress",
      hint: 'Dit element bevat het e-mail adres van de verantwoordelijke organisatie van de bron. Gebruik bij voorkeur een functioneel e-mail adres. Zie ook Zie ook <a href="https://docs.geostandaarden.nl/md/mdprofiel-iso19115/#Verantwoordelijke-organisatie-bron-email" target="_blank">ISO 19115 NL profiel</a>',
      validators: { format: { predefined_pattern: "email" } },
      appearance: {
        addons: [],
        editor: "single_line",
        parameters: { heading: false, placeholder: null },
      },
      default_value: "waterinfo-extra@rws.nl",
    });
  }

  if (findField("Metadatastandaard versie")) {
    console.log(
      'Field "Metadatastandaard versie" (`metadatastandardversion`) already exists'
    );
  } else {
    console.log(
      'Create Single-line string field "Metadatastandaard versie" (`metadatastandardversion`) in model "Inspire Dataset" (`inspire_dataset`)'
    );
    await client.fields.create("Liewx4sGRMCAGCch2TKjaA", {
      id: "BEF9VIoJRgiKa6SZSZQTDw",
      label: "Metadatastandaard versie",
      field_type: "string",
      api_key: "metadatastandardversion",
      hint: 'Dit element is nodig om uitbreidingen of verdere beperkingen op standaarden aan te geven. Dit element bevat de versie (de volledige naam van het profiel) van de metadatastandaard die wordt gebruikt. Zie ook <a href="https://docs.geostandaarden.nl/md/mdprofiel-iso19115/#metadatastandaard-versie" target="_blank">ISO 19115 NL profiel</a>',
      appearance: {
        addons: [],
        editor: "single_line",
        parameters: { heading: false, placeholder: null },
      },
      default_value:
        "Nederlands metadata profiel op ISO 19115 voor geografie 2.0.0",
    });
  }

  if (findField("Thesaurusname")) {
    console.log('Field "Thesaurusname" (`thesaurusname`) already exists');
  } else {
    console.log(
      'Create Single-line string field "Thesaurusname" (`thesaurusname`) in model "Inspire Dataset" (`inspire_dataset`)'
    );
    await client.fields.create("Liewx4sGRMCAGCch2TKjaA", {
      id: "LoXTVry5RTWfgDj2l9OAhw",
      label: "Thesaurusname",
      field_type: "string",
      api_key: "thesaurusname",
      hint: 'Dit is een conditioneel element. Het is verplicht als een trefwoord uit een thesaurus afkomstig is zoals in ieder geval voor de INSPIRE thema\u2019s. Het bevat de naam van de thesaurus waar het trefwoord uit afkomstig is. Voor INSPIRE wordt de naam van de thesaurus gehanteerd, zoals voorgeschreven in de metadataguidelines van INSPIRE. Zie voor GEMET https://www.eionet.europa.eu/gemet/en/themes/.  \nZie ook <a href="https://docs.geostandaarden.nl/md/mdprofiel-iso19115/#thesaurus" target="_blank">ISO 19115 NL profiel</a>',
      appearance: {
        addons: [],
        editor: "string_select",
        parameters: {
          options: [
            { hint: "", label: "AQUO IM Metingen", value: "AQUO IM Metingen" },
            {
              hint: "",
              label: "GEMET \u2013 INSPIRE themes, version 1.0",
              value: "GEMET \u2013 INSPIRE themes, version 1.0",
            },
          ],
        },
      },
      default_value: "AQUO IM Metingen",
    });
  }

  if (findField("Datum van de bron")) {
    console.log(
      'Field "Datum van de bron" (`citation_date_date`) already exists'
    );
  } else {
    console.log(
      'Create Date field "Datum van de bron" (`citation_date_date`) in model "Inspire Dataset" (`inspire_dataset`)'
    );
    newFields["10143369"] = await client.fields.create(
      "Liewx4sGRMCAGCch2TKjaA",
      {
        label: "Datum van de bron",
        field_type: "date",
        api_key: "citation_date_date",
        hint: 'Op z\u2019n minst \u00E9\u00E9n van de elementen Datum creatie, Datum publicatie of Datum revisie is verplicht. Zie ook <a href="https://geonovum.github.io/Metadata-ISO19115/#datum-van-de-bron" target="_blank">ISO 19115 NL profiel</a>\n',
        validators: { required: {} },
        appearance: { addons: [], editor: "date_picker", parameters: {} },
        default_value: null,
      }
    );
  }

  if (findField("rol")) {
    console.log('Field "rol" (`role`) already exists');
  } else {
    console.log(
      'Create Single-line string field "rol" (`role`) in model "Inspire Dataset" (`inspire_dataset`)'
    );
    await client.fields.create("Liewx4sGRMCAGCch2TKjaA", {
      id: "ELSrYu9EQO60TyeUB_bDzA",
      label: "rol",
      field_type: "string",
      api_key: "role",
      hint: 'Dit element geeft de rol van de verantwoordelijke organisatie van de bron weer. Zie ook <a href="https://docs.geostandaarden.nl/md/mdprofiel-iso19115/#Verantwoordelijke-organisatie-bron-rol" target="_blank">ISO 19115 NL profiel</a>',
      appearance: {
        addons: [],
        editor: "string_select",
        parameters: {
          options: [
            {
              hint: "Partij die de data verstrekt.",
              label: "resourceProvider",
              value: "resourceProvider",
            },
            {
              hint: "Partij verantwoordelijk voor het beheer van de data.",
              label: "custodian",
              value: "custodian",
            },
            {
              hint: "Partij die eigenaar is van de data.",
              label: "owner",
              value: "owner",
            },
            {
              hint: "Partij die de data gebruikt.",
              label: "user",
              value: "user",
            },
            {
              hint: "Partij die de data verstrekt.",
              label: "distributor",
              value: "distributor",
            },
            {
              hint: "Partij die de data heeft gecre\u00EBerd.",
              label: "originator",
              value: "originator",
            },
            {
              hint: "Partij die optreedt als contactpunt voor uitwisselen van kennis of verstrekking van de data.",
              label: "pointOfContact",
              value: "pointOfContact",
            },
            {
              hint: "Partij die betrokken was bij de uitvoering van onderzoek.",
              label: "principalInvestigator",
              value: "principalInvestigator",
            },
            {
              hint: "Partij die de data heeft bewerkt, zodanig dat de data is gewijzigd.",
              label: "processor",
              value: "processor",
            },
            {
              hint: "Partij die de data publiceert.",
              label: "publisher",
              value: "publisher",
            },
            {
              hint: "Partij die auteur is van de data.",
              label: "author",
              value: "author",
            },
          ],
        },
      },
      default_value: "pointofcontact",
    });
  }

  if (findField("Juridische toegangsrestricties")) {
    console.log(
      'Field "Juridische toegangsrestricties" (`resourceconstraints_accessconstraints`) already exists'
    );
  } else {
    console.log(
      'Create Single-line string field "Juridische toegangsrestricties" (`resourceconstraints_accessconstraints`) in model "Inspire Dataset" (`inspire_dataset`)'
    );
    newFields["10143362"] = await client.fields.create(
      "Liewx4sGRMCAGCch2TKjaA",
      {
        label: "Juridische toegangsrestricties",
        field_type: "string",
        api_key: "resourceconstraints_accessconstraints",
        hint: 'Zie ook <a href="https://geonovum.github.io/Metadata-ISO19115/#juridische-toegangsrestricties" target="_blank">ISO 19115 NL profiel</a>',
        validators: { required: {} },
        appearance: {
          addons: [],
          editor: "string_select",
          parameters: {
            options: [
              {
                hint: "Exclusief recht voor publicatie, productie, of verkoop van rechten op een literair, theater, muzikaal of artistiek werk, of op het gebruik van een commerci\u00EBle druk of label, toegekend bij wet voor een specifieke periode of tijd aan een auteur, componist, artiest of distributeur.",
                label: "Copyright",
                value: "Copyright",
              },
              {
                hint: "Overheid heeft een exclusief recht toegekend om een uitvinding te maken, verkopen, gebruiken of in licentie uit te geven.",
                label: "Patent",
                value: "Patent",
              },
              {
                hint: "Geproduceerde of verkochte informatie wachtend op een patent.",
                label: "PatentPending",
                value: "PatentPending",
              },
              {
                hint: "Een naam, symbool of ander object om een product te identificeren, wat officieel geregistreerd is en gebruik wettelijk voorbehouden is aan de eigenaar of fabrikant.",
                label: "Trademark",
                value: "Trademark",
              },
              {
                hint: "Formele toestemming of iets te doen.",
                label: "License",
                value: "License",
              },
              {
                hint: "Recht op een financieel voordeel van en controle hebben op de distributie een niet tastbaar eigendom wat het resultaat is van creativiteit.",
                label: "IntellectualPropertyRights",
                value: "IntellectualPropertyRights",
              },
              {
                hint: "Verbod op distributie en gebruik.",
                label: "Restricted",
                value: "Restricted",
              },
              {
                hint: "Restrictie niet opgenomen in lijst.",
                label: "OtherRestrictions",
                value: "OtherRestrictions",
              },
            ],
          },
        },
        default_value: "Copyright",
      }
    );
  }

  if (findField("Titel van de bron")) {
    console.log('Field "Titel van de bron" (`citation_title`) already exists');
  } else {
    console.log(
      'Create Single-line string field "Titel van de bron" (`citation_title`) in model "Inspire Dataset" (`inspire_dataset`)'
    );
    newFields["10143371"] = await client.fields.create(
      "Liewx4sGRMCAGCch2TKjaA",
      {
        label: "Titel van de bron",
        field_type: "string",
        api_key: "citation_title",
        hint: 'Dit element dient om de naam van de dataset in vast te leggen. Zie ook <a href="https://geonovum.github.io/Metadata-ISO19115/#titel-van-de-bron" target="_blank">ISO 19115 NL profiel</a>\n',
        validators: { required: {} },
        appearance: {
          addons: [],
          editor: "single_line",
          parameters: { heading: false, placeholder: null },
        },
        default_value: "",
      }
    );
  }

  if (findField("Hi\u00EBrarchieniveau")) {
    console.log(
      'Field "Hi\u00EBrarchieniveau" (`hierarchylevel`) already exists'
    );
  } else {
    console.log(
      'Create Single-line string field "Hi\u00EBrarchieniveau" (`hierarchylevel`) in model "Inspire Dataset" (`inspire_dataset`)'
    );
    newFields["10162515"] = await client.fields.create(
      "Liewx4sGRMCAGCch2TKjaA",
      {
        label: "Hi\u00EBrarchieniveau",
        field_type: "string",
        api_key: "hierarchylevel",
        hint: 'Het element geeft aan waarop de metadata betrekking heeft, de dataset of dataset serie. Zie ook <a href="https://docs.geostandaarden.nl/md/mdprofiel-iso19115/#hi%C3%ABrarchieniveau" target="_blank">ISO 19115 NL profiel</a>',
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
      }
    );
  }

  if (findField("Metadata standaard naam")) {
    console.log(
      'Field "Metadata standaard naam" (`metadatastandardname`) already exists'
    );
  } else {
    console.log(
      'Create Single-line string field "Metadata standaard naam" (`metadatastandardname`) in model "Inspire Dataset" (`inspire_dataset`)'
    );
    await client.fields.create("Liewx4sGRMCAGCch2TKjaA", {
      id: "Ei2sKTDgSZO6RsFquxiiaw",
      label: "Metadata standaard naam",
      field_type: "string",
      api_key: "metadatastandardname",
      hint: 'Dit element bevat de naam van de gebruikte standaard, om de metadata te beschrijven. Zie ook <a href="https://docs.geostandaarden.nl/md/mdprofiel-iso19115/#metadata-standaard-naam" target="_blank">ISO 19115 NL profiel</a>',
      appearance: {
        addons: [],
        editor: "single_line",
        parameters: { heading: false, placeholder: null },
      },
      default_value: "ISO19115",
    });
  }

  if (findField("Verantwoordelijk organisatie metadata")) {
    console.log(
      'Field "Verantwoordelijk organisatie metadata" (`verantwoordelijk_organisatie_metadata`) already exists'
    );
  } else {
    console.log(
      'Create Modular Content (Multiple blocks) field "Verantwoordelijk organisatie metadata" (`verantwoordelijk_organisatie_metadata`) in model "Inspire Dataset" (`inspire_dataset`)'
    );
    await client.fields.create("Liewx4sGRMCAGCch2TKjaA", {
      id: "GbevT-_8T1O68xw1ijxFXQ",
      label: "Verantwoordelijk organisatie metadata",
      field_type: "rich_text",
      api_key: "verantwoordelijk_organisatie_metadata",
      validators: {
        rich_text_blocks: { item_types: ["R_ytpGxJRt-hPe_gjbBqiw"] },
      },
      appearance: {
        addons: [],
        editor: "rich_text",
        parameters: { start_collapsed: false },
      },
      default_value: null,
    });
  }

  if (findField("Samenvatting")) {
    console.log('Field "Samenvatting" (`abstract`) already exists');
  } else {
    console.log(
      'Create Multiple-paragraph text field "Samenvatting" (`abstract`) in model "Inspire Dataset" (`inspire_dataset`)'
    );
    newFields["10143368"] = await client.fields.create(
      "Liewx4sGRMCAGCch2TKjaA",
      {
        label: "Samenvatting",
        field_type: "text",
        api_key: "abstract",
        hint: 'Dit element bevat een beschrijving van de inhoud van de dataset, geef in deze samenvatting  publieks vriendelijk informatie over de inhoud van de dataset. Zie ook <a href="https://geonovum.github.io/Metadata-ISO19115/#samenvatting" target="_blank">ISO 19115 NL profiel</a>\n',
        validators: { required: {} },
        appearance: {
          addons: [],
          editor: "textarea",
          parameters: { placeholder: null },
          type: "textarea",
        },
        default_value: "",
      }
    );
  }

  if (findField("Onderwerp")) {
    console.log('Field "Onderwerp" (`topiccategories`) already exists');
  } else {
    console.log(
      'Create Modular Content (Multiple blocks) field "Onderwerp" (`topiccategories`) in model "Inspire Dataset" (`inspire_dataset`)'
    );
    newFields["10163089"] = await client.fields.create(
      "Liewx4sGRMCAGCch2TKjaA",
      {
        label: "Onderwerp",
        field_type: "rich_text",
        api_key: "topiccategories",
        hint: "Dit is een specifieke aanduiding die in de catalogus (geonetwork) zorgt voor een categorisering van de gegevens. ",
        validators: {
          rich_text_blocks: { item_types: ["2022974"] },
          size: { eq: 1 },
        },
        appearance: {
          addons: [],
          editor: "rich_text",
          parameters: { start_collapsed: false },
        },
        default_value: null,
      }
    );
  }

  if (findField("Taal van de bron")) {
    console.log('Field "Taal van de bron" (`language`) already exists');
  } else {
    console.log(
      'Create Single-line string field "Taal van de bron" (`language`) in model "Inspire Dataset" (`inspire_dataset`)'
    );
    await client.fields.create("Liewx4sGRMCAGCch2TKjaA", {
      id: "Bw5WSGe9TGu_3LhSFjJobw",
      label: "Taal van de bron",
      field_type: "string",
      api_key: "language",
      hint: 'Let op, standaard wordt hier \'dut\' ingevuld, omdat de metadata in het Nederlands is. Zie ook <a href="https://docs.geostandaarden.nl/md/mdprofiel-iso19115/#taal-van-de-bron" target="_blank">ISO 19115 NL profiel</a>',
      validators: { enum: { values: ["dut", "eng", "ger", "fre", "zxx"] } },
      appearance: {
        addons: [],
        editor: "single_line",
        parameters: { heading: false, placeholder: null },
      },
      default_value: "dut",
    });
  }

  // console.log("Update existing fields/fieldsets");

  // console.log(
  //   'Reorder fields/fieldsets for model "Inspire Dataset" (`inspire_dataset`)'
  // );
  // await client.itemTypes.rawReorderFieldsAndFieldsets(
  //   "Liewx4sGRMCAGCch2TKjaA",
  //   {
  //     data: [
  //       {
  //         id: "10143360",
  //         type: "field",
  //         attributes: { position: 0 },
  //         relationships: {
  //           fieldset: { data: { id: "560134", type: "fieldset" } },
  //         },
  //       },
  //       {
  //         id: "10143362",
  //         type: "field",
  //         attributes: { position: 0 },
  //         relationships: {
  //           fieldset: { data: { id: "560132", type: "fieldset" } },
  //         },
  //       },
  //       {
  //         id: "10143371",
  //         type: "field",
  //         attributes: { position: 0 },
  //         relationships: {
  //           fieldset: { data: { id: "560136", type: "fieldset" } },
  //         },
  //       },
  //       {
  //         id: "10162515",
  //         type: "field",
  //         attributes: { position: 0 },
  //         relationships: {
  //           fieldset: { data: { id: "561206", type: "fieldset" } },
  //         },
  //       },
  //       {
  //         id: "MciOlCyATDqKAeWCVthfgg",
  //         type: "field",
  //         attributes: { position: 0 },
  //         relationships: {
  //           fieldset: {
  //             data: { id: "TOSwC4esQFKcXNrW20gK1Q", type: "fieldset" },
  //           },
  //         },
  //       },
  //       {
  //         id: "fFAppifMRJeYDqnflH6d8w",
  //         type: "field",
  //         attributes: { position: 0 },
  //         relationships: {
  //           fieldset: { data: { id: "560133", type: "fieldset" } },
  //         },
  //       },
  //       {
  //         id: "Ei2sKTDgSZO6RsFquxiiaw",
  //         type: "field",
  //         attributes: { position: 0 },
  //         relationships: {
  //           fieldset: {
  //             data: { id: "d5CCVL3pSxGMdchqXBBQJQ", type: "fieldset" },
  //           },
  //         },
  //       },
  //       {
  //         id: "EToHPBiYTSOZ80SxmAWcpg",
  //         type: "field",
  //         attributes: { position: 0 },
  //         relationships: {
  //           fieldset: {
  //             data: { id: "INy1cspgRTCwgrfVa2fTDw", type: "fieldset" },
  //           },
  //         },
  //       },
  //       {
  //         id: "GbevT-_8T1O68xw1ijxFXQ",
  //         type: "field",
  //         attributes: { position: 0 },
  //         relationships: {
  //           fieldset: {
  //             data: { id: "c4ZNV0cQTamwB4mBwbSFpg", type: "fieldset" },
  //           },
  //         },
  //       },
  //       {
  //         id: "10143361",
  //         type: "field",
  //         attributes: { position: 1 },
  //         relationships: {
  //           fieldset: { data: { id: "560132", type: "fieldset" } },
  //         },
  //       },
  //       {
  //         id: "10143370",
  //         type: "field",
  //         attributes: { position: 1 },
  //         relationships: {
  //           fieldset: { data: { id: "560136", type: "fieldset" } },
  //         },
  //       },
  //       {
  //         id: "10162665",
  //         type: "field",
  //         attributes: { position: 1 },
  //         relationships: {
  //           fieldset: {
  //             data: { id: "TOSwC4esQFKcXNrW20gK1Q", type: "fieldset" },
  //           },
  //         },
  //       },
  //       {
  //         id: "11526998",
  //         type: "field",
  //         attributes: { position: 1 },
  //         relationships: {
  //           fieldset: { data: { id: "561206", type: "fieldset" } },
  //         },
  //       },
  //       {
  //         id: "NzxaGK5sSoyuErg9Tabo1Q",
  //         type: "field",
  //         attributes: { position: 1 },
  //         relationships: {
  //           fieldset: {
  //             data: { id: "INy1cspgRTCwgrfVa2fTDw", type: "fieldset" },
  //           },
  //         },
  //       },
  //       {
  //         id: "BEF9VIoJRgiKa6SZSZQTDw",
  //         type: "field",
  //         attributes: { position: 1 },
  //         relationships: {
  //           fieldset: {
  //             data: { id: "d5CCVL3pSxGMdchqXBBQJQ", type: "fieldset" },
  //           },
  //         },
  //       },
  //       {
  //         id: "LoXTVry5RTWfgDj2l9OAhw",
  //         type: "field",
  //         attributes: { position: 1 },
  //         relationships: {
  //           fieldset: { data: { id: "560134", type: "fieldset" } },
  //         },
  //       },
  //       { id: "560136", type: "fieldset", attributes: { position: 1 } },
  //       {
  //         id: "10143369",
  //         type: "field",
  //         attributes: { position: 2 },
  //         relationships: {
  //           fieldset: { data: { id: "560136", type: "fieldset" } },
  //         },
  //       },
  //       {
  //         id: "ELSrYu9EQO60TyeUB_bDzA",
  //         type: "field",
  //         attributes: { position: 2 },
  //         relationships: {
  //           fieldset: {
  //             data: { id: "INy1cspgRTCwgrfVa2fTDw", type: "fieldset" },
  //           },
  //         },
  //       },
  //       {
  //         id: "dGuoZGTzS2WwImU1XIca7Q",
  //         type: "field",
  //         attributes: { position: 2 },
  //         relationships: {
  //           fieldset: { data: { id: "560134", type: "fieldset" } },
  //         },
  //       },
  //       {
  //         id: "INy1cspgRTCwgrfVa2fTDw",
  //         type: "fieldset",
  //         attributes: { position: 2 },
  //       },
  //       {
  //         id: "10143368",
  //         type: "field",
  //         attributes: { position: 3 },
  //         relationships: {
  //           fieldset: { data: { id: "560136", type: "fieldset" } },
  //         },
  //       },
  //       {
  //         id: "bH3ePzx1SqeTPh-VoSw3sQ",
  //         type: "field",
  //         attributes: { position: 3 },
  //         relationships: {
  //           fieldset: { data: { id: "560134", type: "fieldset" } },
  //         },
  //       },
  //       { id: "560134", type: "fieldset", attributes: { position: 3 } },
  //       {
  //         id: "10162813",
  //         type: "field",
  //         attributes: { position: 4 },
  //         relationships: {
  //           fieldset: { data: { id: "560136", type: "fieldset" } },
  //         },
  //       },
  //       {
  //         id: "Y-8xFhLdQHCaeqzSX8MUdg",
  //         type: "field",
  //         attributes: { position: 4 },
  //         relationships: {
  //           fieldset: { data: { id: "560134", type: "fieldset" } },
  //         },
  //       },
  //       { id: "560132", type: "fieldset", attributes: { position: 4 } },
  //       {
  //         id: "10163089",
  //         type: "field",
  //         attributes: { position: 5 },
  //         relationships: {
  //           fieldset: { data: { id: "560136", type: "fieldset" } },
  //         },
  //       },
  //       { id: "560133", type: "fieldset", attributes: { position: 5 } },
  //       {
  //         id: "Bw5WSGe9TGu_3LhSFjJobw",
  //         type: "field",
  //         attributes: { position: 6 },
  //         relationships: {
  //           fieldset: { data: { id: "560136", type: "fieldset" } },
  //         },
  //       },
  //       {
  //         id: "TOSwC4esQFKcXNrW20gK1Q",
  //         type: "fieldset",
  //         attributes: { position: 6 },
  //       },
  //       { id: "561206", type: "fieldset", attributes: { position: 7 } },
  //       {
  //         id: "c4ZNV0cQTamwB4mBwbSFpg",
  //         type: "fieldset",
  //         attributes: { position: 8 },
  //       },
  //       {
  //         id: "d5CCVL3pSxGMdchqXBBQJQ",
  //         type: "fieldset",
  //         attributes: { position: 9 },
  //       },
  //     ],
  //   }
  // );

  // console.log("Finalize models/block models");

  // console.log('Update model "Inspire Dataset" (`inspire_dataset`)');
  // await client.itemTypes.update("Liewx4sGRMCAGCch2TKjaA", {
  //   title_field: newFields["10143371"],
  // });
}
