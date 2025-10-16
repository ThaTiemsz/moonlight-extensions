import ErrorBoundary from "@moonlight-mod/wp/common_ErrorBoundary";
import type { openModal } from "@moonlight-mod/wp/discord/components/common/index";
import {
  // FormSection,
  ModalRoot,
  Scroller,
  // SearchableSelect,
  Text
} from "@moonlight-mod/wp/discord/components/common/index";
import { marginBottom20, marginBottom8 } from "@moonlight-mod/wp/discord/styles/shared/Margins.css";
import React, { useEffect, useState } from "@moonlight-mod/wp/react";
import { IsoLangs } from "@moonlight-mod/wp/translateText_constants";
import type * as nodeModule from "../node.ts";
import spacepack from "@moonlight-mod/wp/spacepack_spacepack";

type ModalProps = Parameters<Parameters<typeof openModal>[0]>[0];

const natives = moonlight.getNatives("translateText") as typeof nodeModule;
const translateTo = moonlight.getConfigOption<string>("translateText", "translateTo") ?? "en";

function getLangName(iso: string) {
  return IsoLangs?.[iso as keyof typeof IsoLangs] ?? iso;
}

export function TranslateTextModal({ text, transitionState }: ModalProps & { text: string | undefined }) {
  const translate = natives?.translate;
  const [translation, setTranslation] = useState<string | null>(null);
  const [autoDetected] = useState(true);
  const [fromLang] = useState("auto");
  const [fromLangName, setFromLangName] = useState("");
  const [toLang, setToLang] = useState(translateTo);

  useEffect(() => {
    (async () => {
      setTranslation(null);

      const res = await translate(text!, {
        from: fromLang,
        to: toLang
      }).catch(() => null);

      if (res !== null) {
        const langCode = autoDetected ? res.from.language.iso : fromLang;
        setFromLangName(getLangName(langCode));
        setTranslation(res.text);
      } else {
        setTranslation(
          "Could not translate text. Requests could be rate limited or the text is too long. Please try again later."
        );
      }
    })();
  }, [text, fromLang, toLang]);

  const languageOptions = Object.entries(IsoLangs).map(([key, value]) => ({
    label: value,
    value: key
  }));

  const SearchableSelect = spacepack.findByCode(".searchableSelect,{")[0].exports.V;

  return (
    <ErrorBoundary>
      <ModalRoot size="medium" transitionState={transitionState}>
        <Scroller fade>
          <div style={{ padding: 16 }}>
            <div className={marginBottom8} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {/* Google Translate uses auto detection no matter what... */}
              {/* <FormSection tag="h5" title="Translate from">
                <SearchableSelect
                  autofocus={false}
                  clearable={false}
                  placeholder="Language"
                  // options={[{ label: "Detect language", value: "auto" }, ...languageOptions]}
                  value={fromLang}
                  onChange={(value: string) => {
                    setFromLang(value);
                    setAutoDetected(value === "auto");
                  }}
                />
              </FormSection> */}

              <Text tag="h5" variant="text-lg/semibold">
                Translate to
              </Text>

              <SearchableSelect
                className={marginBottom20}
                autofocus={false}
                clearable={false}
                placeholder="Language"
                options={languageOptions}
                value={toLang}
                onChange={(value: string) => {
                  setToLang(value);
                }}
              />
            </div>

            <Text tag="h5" variant="text-lg/semibold" className={marginBottom8}>
              {fromLang
                ? autoDetected
                  ? `Original Text (${fromLangName} - Detected)`
                  : `Original Text (${fromLangName})`
                : "Original Text"}
            </Text>

            <Text selectable variant="text-md/normal" className={marginBottom20}>
              {text}
            </Text>

            <Text tag="h5" variant="text-lg/semibold" className={marginBottom8}>
              Translated Text ({getLangName(toLang)})
            </Text>

            <Text selectable variant="text-md/normal">
              {translation ?? "Translating..."}
            </Text>
          </div>
        </Scroller>
      </ModalRoot>
    </ErrorBoundary>
  );
}
