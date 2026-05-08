"use client";

import type { CSSProperties } from "react";
import "./carousel.css";
import { EditableText } from "./EditableText";
import type {
  CarouselDraft,
  Slide,
  CoverSlide,
  BodySlide,
  MethodSlide,
  StepsSlide,
  DontsSlide,
  CtaSlide,
} from "@/lib/schemas";

const ADDRESSES = [
  { city: "GROWTH", line: "acquisition & contenu" },
  { city: "STORYTELLING", line: "narrer ce qui compte" },
  { city: "CONSEIL", line: "stratégie & build-in-public" },
];

const FOOTER_LABEL = "Osecom";
const FOOTER_SIDE = "communication & storytelling";

interface CarouselProps {
  draft: CarouselDraft;
  editable?: boolean;
  onChange?: (draft: CarouselDraft) => void;
}

export default function Carousel({ draft, editable, onChange }: CarouselProps) {
  const updateSlide = (i: number, slide: Slide) => {
    if (!onChange) return;
    const slides = draft.slides.slice();
    slides[i] = slide;
    onChange({ ...draft, slides });
  };

  const themeStyle = draft.theme
    ? ({
        "--cs-cover": `url(/bg/themes/${draft.theme}/cover.png)`,
        "--cs-body": `url(/bg/themes/${draft.theme}/body.png)`,
        "--cs-cta": `url(/bg/themes/${draft.theme}/cta.png)`,
      } as CSSProperties)
    : undefined;

  return (
    <div className="cs-deck" style={themeStyle}>
      {draft.slides.map((slide, i) => (
        <div key={i} className="cs-frame">
          <div className="cs-frame-label">
            Slide {String(i + 1).padStart(2, "0")} · {slide.type}
          </div>
          <SlideRenderer
            slide={slide}
            editable={editable}
            onChange={(s) => updateSlide(i, s)}
          />
        </div>
      ))}
    </div>
  );
}

interface SlideProps<T extends Slide> {
  slide: T;
  editable?: boolean;
  onChange: (slide: T) => void;
}

function SlideRenderer({
  slide,
  editable,
  onChange,
}: {
  slide: Slide;
  editable?: boolean;
  onChange: (s: Slide) => void;
}) {
  switch (slide.type) {
    case "cover":
      return <Cover slide={slide} editable={editable} onChange={onChange} />;
    case "body":
      return <Body slide={slide} editable={editable} onChange={onChange} />;
    case "method":
      return <Method slide={slide} editable={editable} onChange={onChange} />;
    case "steps":
      return <Steps slide={slide} editable={editable} onChange={onChange} />;
    case "donts":
      return <Donts slide={slide} editable={editable} onChange={onChange} />;
    case "cta":
      return <Cta slide={slide} editable={editable} onChange={onChange} />;
  }
}

function Cover({ slide, editable, onChange }: SlideProps<CoverSlide>) {
  return (
    <div className="cs-slide cs-cover-bg">
      <div className="cs-hook">
        <h1 className="cs-hook-title">
          <EditableText
            value={slide.title}
            editable={editable}
            onChange={(title) => onChange({ ...slide, title })}
          />
        </h1>
        <p className="cs-hook-subtitle">
          <EditableText
            value={slide.subtitle}
            editable={editable}
            onChange={(subtitle) => onChange({ ...slide, subtitle })}
          />
        </p>
        <Footer />
      </div>
    </div>
  );
}

function Cta({ slide, editable, onChange }: SlideProps<CtaSlide>) {
  return (
    <div className="cs-slide cs-cta-bg">
      <div className="cs-hook">
        <h1 className="cs-hook-title">
          <EditableText
            value={slide.title}
            editable={editable}
            onChange={(title) => onChange({ ...slide, title })}
          />
        </h1>
        <p className="cs-hook-subtitle">
          <EditableText
            value={slide.subtitle}
            editable={editable}
            onChange={(subtitle) => onChange({ ...slide, subtitle })}
          />
        </p>
        <div className="cs-cta-button">
          <div className="cs-cta-button-label">
            <EditableText
              value={slide.button.label}
              editable={editable}
              onChange={(label) =>
                onChange({ ...slide, button: { ...slide.button, label } })
              }
            />
          </div>
          <div className="cs-cta-button-text">
            <EditableText
              value={slide.button.text}
              editable={editable}
              onChange={(text) =>
                onChange({ ...slide, button: { ...slide.button, text } })
              }
            />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="cs-hook-footer">
      <div className="cs-hook-footer-head">
        <span className="cs-accent-dot" />
        <span className="cs-footer-label">{FOOTER_LABEL}</span>
        <span className="cs-footer-spacer" />
        <span className="cs-footer-side">{FOOTER_SIDE}</span>
      </div>
      <div className="cs-addresses">
        {ADDRESSES.map((a) => (
          <div key={a.city} className="cs-addr">
            <span className="cs-addr-city">{a.city}</span> — {a.line}
          </div>
        ))}
      </div>
    </div>
  );
}

function Tag({
  value,
  editable,
  onChange,
}: {
  value: string;
  editable?: boolean;
  onChange?: (v: string) => void;
}) {
  return (
    <div className="cs-tag">
      <span className="cs-tag-bar" />
      <span className="cs-tag-text">
        {editable && onChange ? (
          <EditableText value={value} editable onChange={onChange} />
        ) : (
          value
        )}
      </span>
    </div>
  );
}

function Action({
  text,
  editable,
  onChange,
}: {
  text: string;
  editable?: boolean;
  onChange?: (v: string) => void;
}) {
  return (
    <div className="cs-action">
      <span className="cs-action-dot" />
      <p className="cs-action-text">
        <EditableText value={text} editable={editable} onChange={onChange} />
      </p>
    </div>
  );
}

function pickTitleSize(text: string): string {
  const charCount = text.replace(/[*]/g, "").length;
  if (charCount > 50) return "cs-title-s3";
  if (charCount > 35) return "cs-title-s2";
  return "";
}

function Body({ slide, editable, onChange }: SlideProps<BodySlide>) {
  return (
    <div className="cs-slide cs-body-bg">
      <div className="cs-body-content">
        <Tag
          value={slide.tag}
          editable={editable}
          onChange={(tag) => onChange({ ...slide, tag })}
        />
        <h1 className={`cs-title ${pickTitleSize(slide.title)}`}>
          <EditableText
            value={slide.title}
            editable={editable}
            onChange={(title) => onChange({ ...slide, title })}
          />
        </h1>
        <p className="cs-body-text">
          <EditableText
            value={slide.body}
            editable={editable}
            onChange={(body) => onChange({ ...slide, body })}
          />
        </p>
        {slide.testbox && (
          <div className="cs-testbox">
            <div className="cs-testbox-label">
              {editable ? (
                <EditableText
                  value={slide.testbox.label}
                  editable
                  onChange={(label) =>
                    onChange({
                      ...slide,
                      testbox: { ...slide.testbox!, label },
                    })
                  }
                />
              ) : (
                slide.testbox.label
              )}
            </div>
            <p className="cs-testbox-text">
              <EditableText
                value={slide.testbox.text}
                editable={editable}
                onChange={(text) =>
                  onChange({ ...slide, testbox: { ...slide.testbox!, text } })
                }
              />
            </p>
          </div>
        )}
        {!slide.testbox && <div style={{ marginBottom: "auto" }} />}
        <Action
          text={slide.action}
          editable={editable}
          onChange={(action) => onChange({ ...slide, action })}
        />
      </div>
    </div>
  );
}

function Method({ slide, editable, onChange }: SlideProps<MethodSlide>) {
  const updateStep = (i: number, patch: Partial<MethodSlide["steps"][number]>) => {
    const steps = slide.steps.slice();
    steps[i] = { ...steps[i], ...patch };
    onChange({ ...slide, steps });
  };
  return (
    <div className="cs-slide cs-body-bg">
      <div className="cs-body-content">
        <Tag
          value={slide.tag}
          editable={editable}
          onChange={(tag) => onChange({ ...slide, tag })}
        />
        <h1 className={`cs-title ${pickTitleSize(slide.title)}`}>
          <EditableText
            value={slide.title}
            editable={editable}
            onChange={(title) => onChange({ ...slide, title })}
          />
        </h1>
        <div className="cs-steps">
          {slide.steps.map((s, i) => (
            <div key={i} className="cs-step">
              <div className="cs-step-num">{String(i + 1).padStart(2, "0")}</div>
              <div>
                <div className="cs-step-title">
                  {editable ? (
                    <EditableText
                      value={s.title}
                      editable
                      onChange={(title) => updateStep(i, { title })}
                    />
                  ) : (
                    s.title
                  )}
                </div>
                <div className="cs-step-text">
                  {editable ? (
                    <EditableText
                      value={s.text}
                      editable
                      onChange={(text) => updateStep(i, { text })}
                    />
                  ) : (
                    s.text
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {(slide.action || editable) && (
          <Action
            text={slide.action ?? ""}
            editable={editable}
            onChange={(action) => onChange({ ...slide, action })}
          />
        )}
      </div>
    </div>
  );
}

function Steps({ slide, editable, onChange }: SlideProps<StepsSlide>) {
  const updateStep = (i: number, patch: Partial<StepsSlide["steps"][number]>) => {
    const steps = slide.steps.slice();
    steps[i] = { ...steps[i], ...patch };
    onChange({ ...slide, steps });
  };
  return (
    <div className="cs-slide cs-body-bg">
      <div className="cs-body-content">
        <Tag
          value={slide.tag}
          editable={editable}
          onChange={(tag) => onChange({ ...slide, tag })}
        />
        <h1 className={`cs-title ${pickTitleSize(slide.title)}`}>
          <EditableText
            value={slide.title}
            editable={editable}
            onChange={(title) => onChange({ ...slide, title })}
          />
        </h1>
        <div className="cs-step-list">
          {slide.steps.map((s, i) => (
            <div key={i} className="cs-step-row">
              <div className="cs-step-row-num">{String(i + 1).padStart(2, "0")}</div>
              <div className="cs-step-row-content">
                <div className="cs-step-row-title">
                  {editable ? (
                    <EditableText
                      value={s.title}
                      editable
                      onChange={(title) => updateStep(i, { title })}
                    />
                  ) : (
                    s.title
                  )}
                </div>
                <div className="cs-step-row-desc">
                  {editable ? (
                    <EditableText
                      value={s.text}
                      editable
                      onChange={(text) => updateStep(i, { text })}
                    />
                  ) : (
                    s.text
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {(slide.action || editable) && (
          <Action
            text={slide.action ?? ""}
            editable={editable}
            onChange={(action) => onChange({ ...slide, action })}
          />
        )}
      </div>
    </div>
  );
}

function Donts({ slide, editable, onChange }: SlideProps<DontsSlide>) {
  const updateDont = (i: number, patch: Partial<DontsSlide["donts"][number]>) => {
    const donts = slide.donts.slice();
    donts[i] = { ...donts[i], ...patch };
    onChange({ ...slide, donts });
  };
  return (
    <div className="cs-slide cs-body-bg">
      <div className="cs-body-content">
        <Tag
          value={slide.tag}
          editable={editable}
          onChange={(tag) => onChange({ ...slide, tag })}
        />
        <h1 className={`cs-title ${pickTitleSize(slide.title)}`}>
          <EditableText
            value={slide.title}
            editable={editable}
            onChange={(title) => onChange({ ...slide, title })}
          />
        </h1>
        <div className="cs-donts">
          {slide.donts.map((d, i) => (
            <div key={i} className="cs-dont">
              <div className="cs-dont-cross">✕</div>
              <div className="cs-dont-content">
                <div className="cs-dont-title">
                  {editable ? (
                    <EditableText
                      value={d.title}
                      editable
                      onChange={(title) => updateDont(i, { title })}
                    />
                  ) : (
                    d.title
                  )}
                </div>
                <div className="cs-dont-reason">
                  {editable ? (
                    <EditableText
                      value={d.reason}
                      editable
                      onChange={(reason) => updateDont(i, { reason })}
                    />
                  ) : (
                    d.reason
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <Action
          text={slide.action}
          editable={editable}
          onChange={(action) => onChange({ ...slide, action })}
        />
      </div>
    </div>
  );
}
