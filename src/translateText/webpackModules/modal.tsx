import ErrorBoundary from "@moonlight-mod/wp/common_ErrorBoundary";
import type { openModal } from "@moonlight-mod/wp/discord/components/common/index";
import {
  FormSection,
  ModalRoot,
  Scroller,
  SearchableSelect,
  Text
} from "@moonlight-mod/wp/discord/components/common/index";
import { marginBottom20 } from "@moonlight-mod/wp/discord/styles/shared/Margins.css";
import React, { useEffect, useState } from "@moonlight-mod/wp/react";
import { IsoLangs } from "@moonlight-mod/wp/translateText_constants";
import type * as nodeModule from "../node.ts";

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

  return (
    <ErrorBoundary>
      <ModalRoot size="medium" transitionState={transitionState}>
        <Scroller fade>
          <div style={{ padding: 16 }}>
            <div className={marginBottom20} style={{ display: "flex", gap: "15px" }}>
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

              <FormSection tag="h5" title="Translate to">
                <SearchableSelect
                  autofocus={false}
                  clearable={false}
                  placeholder="Language"
                  options={languageOptions}
                  value={toLang}
                  onChange={(value: string) => {
                    setToLang(value);
                  }}
                />
              </FormSection>
            </div>

            <FormSection
              tag="h5"
              className={marginBottom20}
              title={
                fromLang
                  ? autoDetected
                    ? `Original Text (${fromLangName} - Detected)`
                    : `Original Text (${fromLangName})`
                  : "Original Text"
              }
            >
              <Text selectable variant="text-sm/normal">
                {text}
              </Text>
            </FormSection>

            <FormSection tag="h5" className={marginBottom20} title={`Translated Text (${getLangName(toLang)})`}>
              <Text selectable variant="text-sm/normal">
                {translation ?? "Translating..."}
              </Text>
            </FormSection>
          </div>
        </Scroller>
      </ModalRoot>
    </ErrorBoundary>
  );
}
