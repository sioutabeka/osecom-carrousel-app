import { z } from "zod";

const CoverSlideSchema = z.object({
  type: z.literal("cover"),
  title: z.string().min(1),
  subtitle: z.string().min(1),
});

const TestBoxSchema = z.object({
  label: z.string().min(1),
  text: z.string().min(1),
});

const BodySlideSchema = z.object({
  type: z.literal("body"),
  tag: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  testbox: TestBoxSchema.optional(),
  action: z.string().min(1),
});

const StepItemSchema = z.object({
  title: z.string().min(1),
  text: z.string().min(1),
});

const MethodSlideSchema = z.object({
  type: z.literal("method"),
  tag: z.string().min(1),
  title: z.string().min(1),
  steps: z.array(StepItemSchema).min(2).max(3),
  action: z.string().optional(),
});

const StepsSlideSchema = z.object({
  type: z.literal("steps"),
  tag: z.string().min(1),
  title: z.string().min(1),
  steps: z.array(StepItemSchema).min(4).max(8),
  action: z.string().optional(),
});

const DontItemSchema = z.object({
  title: z.string().min(1),
  reason: z.string().min(1),
});

const DontsSlideSchema = z.object({
  type: z.literal("donts"),
  tag: z.string().min(1),
  title: z.string().min(1),
  donts: z.array(DontItemSchema).min(3).max(5),
  action: z.string().min(1),
});

const CtaButtonSchema = z.object({
  label: z.string().min(1),
  text: z.string().min(1),
});

const CtaSlideSchema = z.object({
  type: z.literal("cta"),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  button: CtaButtonSchema,
});

export const Slide = z.discriminatedUnion("type", [
  CoverSlideSchema,
  BodySlideSchema,
  MethodSlideSchema,
  StepsSlideSchema,
  DontsSlideSchema,
  CtaSlideSchema,
]);

export const CarouselDraft = z.object({
  theme: z.string().optional(),
  slides: z.array(Slide).min(5).max(12),
});

export type CoverSlide = z.infer<typeof CoverSlideSchema>;
export type BodySlide = z.infer<typeof BodySlideSchema>;
export type MethodSlide = z.infer<typeof MethodSlideSchema>;
export type StepsSlide = z.infer<typeof StepsSlideSchema>;
export type DontsSlide = z.infer<typeof DontsSlideSchema>;
export type CtaSlide = z.infer<typeof CtaSlideSchema>;
export type Slide = z.infer<typeof Slide>;
export type CarouselDraft = z.infer<typeof CarouselDraft>;
