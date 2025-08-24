import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { save } from "@/utils/storage";
import type { ResumeData, Section } from "@/data/initialData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Trash2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const contactSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  type: z.enum(["link", "phone", "email"]),
});

const positionSchema = z.object({
  title: z.string().min(1),
  start: z.string().optional(),
  end: z.string().optional(),
  bullets: z.array(z.string()).optional(),
});

const timelineItemSchema = z.object({
  heading: z.string().min(1),
  subheading: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  bullets: z.array(z.string()).optional(),
  meta: z.string().optional(),
  positions: z.array(positionSchema).optional(),
});

const richSectionSchema = z.object({
  key: z.string().min(1),
  title: z.string().min(1),
  placement: z.enum(["left", "right"]),
  order: z.number().min(0),
  type: z.literal("rich"),
  content: z.string(),
});

const groupedSectionSchema = z.object({
  key: z.string().min(1),
  title: z.string().min(1),
  placement: z.enum(["left", "right"]),
  order: z.number().min(0),
  type: z.literal("grouped"),
  groups: z.array(
    z.object({
      name: z.string().min(1),
      items: z.array(z.string()),
    })
  ),
});

const timelineSectionSchema = z.object({
  key: z.string().min(1),
  title: z.string().min(1),
  placement: z.enum(["left", "right"]),
  order: z.number().min(0),
  type: z.literal("timeline"),
  items: z.array(timelineItemSchema),
});

const sectionSchema = z.discriminatedUnion("type", [
  richSectionSchema,
  groupedSectionSchema,
  timelineSectionSchema,
]);

const schema = z.object({
  meta: z.object({
    fullName: z.string().min(1),
    title: z.string().min(1),
    contact: z.array(contactSchema),
  }),
  layout: z.object({
    leftWidth: z.number().min(20).max(50),
    rightWidth: z.number().min(50).max(80),
  }),
  sections: z.array(sectionSchema),
});

type FormData = z.infer<typeof schema>;

type Props = {
  value: ResumeData;
  onChange: (val: ResumeData) => void;
};

export default function ResumeForm({ value, onChange }: Props) {
  const { toast } = useToast();
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: value,
    mode: "onChange",
  });

  const contactArray = useFieldArray({
    control: form.control,
    name: "meta.contact",
  });
  const sectionsArray = useFieldArray({
    control: form.control,
    name: "sections",
  });

  // Sync to parent + localStorage on change
  useEffect(() => {
    const sub = form.watch((val) => {
      if (!val) return;
      const v = val as ResumeData;
      onChange(v);
      save(v);
    });
    return () => sub.unsubscribe();
  }, [form, onChange]);

  const handleCopyResumeData = async () => {
    try {
      const resumeData = form.getValues();
      await navigator.clipboard.writeText(JSON.stringify(resumeData, null, 2));
      setCopied(true);
      toast({
        title: "Success",
        description: "Resume data copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy resume data",
        variant: "destructive",
      });
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-150px)] box-border">
      <div className=" space-y-4 w-full box-border ">
        <Accordion
          type="multiple"
          value={openSections}
          onValueChange={setOpenSections}
          className="space-y-2 "

        >
          {/* Header Section */}
          <AccordionItem value="header" className="border rounded-lg">
            <AccordionTrigger className="px-2">
              <span className="font-semibold">Header</span>
            </AccordionTrigger>
            <AccordionContent className="px-2 pb-4">
              <div className="space-y-3">
                <div>
                  <Label>Full Name</Label>
                  <Textarea
                    {...form.register("meta.fullName")}
                    className="min-h-[60px] resize-none"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label>Title</Label>
                  <Textarea
                    {...form.register("meta.title")}
                    className="min-h-[60px] resize-none"
                    placeholder="Enter your professional title"
                  />
                </div>

                <div>
                  <Label>Contact Information</Label>
                  <div className="space-y-3">
                    {contactArray.fields.map((f, idx) => (
                      <div
                        key={f.id}
                        className="border rounded-md p-3 space-y-3"
                      >
                        <div>
                          <Label>Label</Label>
                          <Textarea
                            {...form.register(`meta.contact.${idx}.label`)}
                            placeholder="e.g., Email, Phone, LinkedIn"
                            className="min-h-[50px] resize-none"
                          />
                        </div>
                        <div>
                          <Label>Value</Label>
                          <Textarea
                            {...form.register(`meta.contact.${idx}.value`)}
                            placeholder="Enter the actual value"
                            className="min-h-[50px] resize-none"
                          />
                        </div>
                        <div>
                          <Label>Type</Label>
                          <Controller
                            control={form.control}
                            name={`meta.contact.${idx}.type`}
                            render={({ field }) => (
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="link">Link</SelectItem>
                                  <SelectItem value="phone">Phone</SelectItem>
                                  <SelectItem value="email">Email</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        <Button
                          variant="destructive"
                          type="button"
                          size="sm"
                          onClick={() => contactArray.remove(idx)}
                          className="w-full"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Contact
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        contactArray.append({
                          label: "",
                          value: "",
                          type: "link",
                        })
                      }
                      className="w-full"
                    >
                      + Add Contact
                    </Button>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Sections */}
          <AccordionItem value="sections" className="border rounded-lg">
            <AccordionTrigger className="px-4">
              <span className="font-semibold">Sections</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
                {sectionsArray.fields.map((f, idx) => {
                  const type = form.watch(
                    `sections.${idx}.type`
                  ) as Section["type"];
                  const sectionId = `section-${idx}`;

                  return (
                    <AccordionItem
                      key={f.id}
                      value={sectionId}
                      className="border rounded-md"
                    >
                      <AccordionTrigger className="px-3">
                        <span className="text-sm font-medium">
                          {form.watch(`sections.${idx}.title`) ||
                            `Section ${idx + 1}`}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="px-3 pb-3">
                        <div className="space-y-3">
                          <div>
                            <Label>Key</Label>
                            <Textarea
                              {...form.register(`sections.${idx}.key`)}
                              placeholder="section-key"
                              className="min-h-[50px] resize-none"
                            />
                          </div>
                          <div>
                            <Label>Title</Label>
                            <Textarea
                              {...form.register(`sections.${idx}.title`)}
                              placeholder="Section Title"
                              className="min-h-[50px] resize-none"
                            />
                          </div>
                          <div>
                            <Label>Placement</Label>
                            <Controller
                              control={form.control}
                              name={`sections.${idx}.placement`}
                              render={({ field }) => (
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select column" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="left">Left</SelectItem>
                                    <SelectItem value="right">Right</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>
                          <div>
                            <Label>Order</Label>
                            <Input
                              type="number"
                              {...form.register(`sections.${idx}.order`, {
                                valueAsNumber: true,
                              })}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label>Type</Label>
                            <Controller
                              control={form.control}
                              name={`sections.${idx}.type`}
                              render={({ field }) => (
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="rich">
                                      Rich (paragraph)
                                    </SelectItem>
                                    <SelectItem value="grouped">
                                      Grouped (skills)
                                    </SelectItem>
                                    <SelectItem value="timeline">
                                      Timeline (exp/projects/edu)
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>

                          {type === "rich" && (
                            <div>
                              <Label>Content</Label>
                              <Textarea
                                rows={6}
                                {...form.register(`sections.${idx}.content`)}
                                placeholder="Enter your content here..."
                                className="resize-none"
                              />
                            </div>
                          )}

                          {type === "grouped" && (
                            <div className="space-y-3">
                              <Label>Groups</Label>
                              <div className="space-y-4">
                                {form
                                  .watch(`sections.${idx}.groups`)
                                  ?.map((group, groupIdx) => (
                                    <div
                                      key={groupIdx}
                                      className="border rounded-md p-3 space-y-3"
                                    >
                                      <div className="flex justify-between items-center">
                                        <Label>Group {groupIdx + 1}</Label>
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => {
                                            const groups = form.getValues(
                                              `sections.${idx}.groups`
                                            );
                                            groups.splice(groupIdx, 1);
                                            form.setValue(
                                              `sections.${idx}.groups`,
                                              groups
                                            );
                                          }}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      <div>
                                        <Label>Group Name</Label>
                                        <Textarea
                                          {...form.register(
                                            `sections.${idx}.groups.${groupIdx}.name`
                                          )}
                                          placeholder="Enter group name"
                                          className="min-h-[50px] resize-none"
                                        />
                                      </div>
                                      <div>
                                        <Label>Items</Label>
                                        <div className="space-y-2">
                                          {group.items?.map(
                                            (_item, itemIdx) => (
                                              <div
                                                key={itemIdx}
                                                className="flex gap-2 items-start"
                                              >
                                                <Textarea
                                                  {...form.register(
                                                    `sections.${idx}.groups.${groupIdx}.items.${itemIdx}`
                                                  )}
                                                  placeholder="Enter item"
                                                  className="min-h-[50px] resize-none flex-1"
                                                />
                                                <Button
                                                  type="button"
                                                  size="sm"
                                                  variant="destructive"
                                                  onClick={() => {
                                                    const items =
                                                      form.getValues(
                                                        `sections.${idx}.groups.${groupIdx}.items`
                                                      );
                                                    items.splice(itemIdx, 1);
                                                    form.setValue(
                                                      `sections.${idx}.groups.${groupIdx}.items`,
                                                      items
                                                    );
                                                  }}
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </Button>
                                              </div>
                                            )
                                          )}
                                          <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => {
                                              const items =
                                                form.getValues(
                                                  `sections.${idx}.groups.${groupIdx}.items`
                                                ) || [];
                                              form.setValue(
                                                `sections.${idx}.groups.${groupIdx}.items`,
                                                [...items, ""]
                                              );
                                            }}
                                            className="w-full"
                                          >
                                            + Add Item
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                <Button
                                  type="button"
                                  onClick={() => {
                                    const groups =
                                      form.getValues(
                                        `sections.${idx}.groups`
                                      ) || [];
                                    form.setValue(`sections.${idx}.groups`, [
                                      ...groups,
                                      { name: "", items: [] },
                                    ]);
                                  }}
                                  className="w-full"
                                >
                                  + Add Group
                                </Button>
                              </div>
                            </div>
                          )}

                          {type === "timeline" && (
                            <div className="space-y-3">
                              <Label>Timeline Items</Label>
                              <div className="space-y-4">
                                {form
                                  .watch(`sections.${idx}.items`)
                                  ?.map((item, itemIdx) => (
                                    <div
                                      key={itemIdx}
                                      className="border rounded-md p-3 space-y-3"
                                    >
                                      <div className="flex justify-between items-center">
                                        <Label>Item {itemIdx + 1}</Label>
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => {
                                            const items = form.getValues(
                                              `sections.${idx}.items`
                                            );
                                            items.splice(itemIdx, 1);
                                            form.setValue(
                                              `sections.${idx}.items`,
                                              items
                                            );
                                          }}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>

                                      <div>
                                        <Label>
                                          Heading (Company/Organization)
                                        </Label>
                                        <Textarea
                                          {...form.register(
                                            `sections.${idx}.items.${itemIdx}.heading`
                                          )}
                                          placeholder="Enter company or organization name"
                                          className="min-h-[50px] resize-none"
                                        />
                                      </div>

                                      <div>
                                        <Label>Meta (optional)</Label>
                                        <Textarea
                                          {...form.register(
                                            `sections.${idx}.items.${itemIdx}.meta`
                                          )}
                                          placeholder="Additional information"
                                          className="min-h-[50px] resize-none"
                                        />
                                      </div>

                                      <div>
                                        <Label>Positions</Label>
                                        <div className="space-y-4">
                                          {(item.positions || [])?.map(
                                            (position, positionIdx) => (
                                              <div
                                                key={positionIdx}
                                                className="border rounded-md p-3 space-y-3"
                                              >
                                                <div className="flex justify-between items-center">
                                                  <Label>
                                                    Position {positionIdx + 1}
                                                  </Label>
                                                  <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => {
                                                      const positions =
                                                        form.getValues(
                                                          `sections.${idx}.items.${itemIdx}.positions`
                                                        ) || [];
                                                      positions.splice(
                                                        positionIdx,
                                                        1
                                                      );
                                                      form.setValue(
                                                        `sections.${idx}.items.${itemIdx}.positions`,
                                                        positions
                                                      );
                                                    }}
                                                  >
                                                    <Trash2 className="h-4 w-4" />
                                                  </Button>
                                                </div>

                                                <div>
                                                  <Label>Title</Label>
                                                  <Textarea
                                                    {...form.register(
                                                      `sections.${idx}.items.${itemIdx}.positions.${positionIdx}.title`
                                                    )}
                                                    placeholder="Enter position title"
                                                    className="min-h-[50px] resize-none"
                                                  />
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                  <div>
                                                    <Label>Start Date</Label>
                                                    <Input
                                                      {...form.register(
                                                        `sections.${idx}.items.${itemIdx}.positions.${positionIdx}.start`
                                                      )}
                                                      placeholder="MM/YYYY"
                                                    />
                                                  </div>
                                                  <div>
                                                    <Label>End Date</Label>
                                                    <Input
                                                      {...form.register(
                                                        `sections.${idx}.items.${itemIdx}.positions.${positionIdx}.end`
                                                      )}
                                                      placeholder="MM/YYYY"
                                                    />
                                                  </div>
                                                </div>

                                                <div>
                                                  <Label>Bullet Points</Label>
                                                  <div className="space-y-2">
                                                    {(
                                                      position.bullets || []
                                                    )?.map(
                                                      (_bullet, bulletIdx) => (
                                                        <div
                                                          key={bulletIdx}
                                                          className="flex gap-2 items-start"
                                                        >
                                                          <Textarea
                                                            {...form.register(
                                                              `sections.${idx}.items.${itemIdx}.positions.${positionIdx}.bullets.${bulletIdx}`
                                                            )}
                                                            placeholder="Enter bullet point"
                                                            className="min-h-[50px] resize-none flex-1"
                                                          />
                                                          <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => {
                                                              const bullets =
                                                                form.getValues(
                                                                  `sections.${idx}.items.${itemIdx}.positions.${positionIdx}.bullets`
                                                                ) || [];
                                                              bullets.splice(
                                                                bulletIdx,
                                                                1
                                                              );
                                                              form.setValue(
                                                                `sections.${idx}.items.${itemIdx}.positions.${positionIdx}.bullets`,
                                                                bullets
                                                              );
                                                            }}
                                                          >
                                                            <Trash2 className="h-4 w-4" />
                                                          </Button>
                                                        </div>
                                                      )
                                                    )}
                                                    <Button
                                                      type="button"
                                                      size="sm"
                                                      variant="secondary"
                                                      onClick={() => {
                                                        const bullets =
                                                          form.getValues(
                                                            `sections.${idx}.items.${itemIdx}.positions.${positionIdx}.bullets`
                                                          ) || [];
                                                        form.setValue(
                                                          `sections.${idx}.items.${itemIdx}.positions.${positionIdx}.bullets`,
                                                          [...bullets, ""]
                                                        );
                                                      }}
                                                      className="w-full"
                                                    >
                                                      + Add Bullet
                                                    </Button>
                                                  </div>
                                                </div>
                                              </div>
                                            )
                                          )}
                                          <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => {
                                              const positions =
                                                form.getValues(
                                                  `sections.${idx}.items.${itemIdx}.positions`
                                                ) || [];
                                              form.setValue(
                                                `sections.${idx}.items.${itemIdx}.positions`,
                                                [
                                                  ...positions,
                                                  {
                                                    title: "",
                                                    start: "",
                                                    end: "",
                                                    bullets: [],
                                                  },
                                                ]
                                              );
                                            }}
                                            className="w-full"
                                          >
                                            + Add Position
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                <Button
                                  type="button"
                                  onClick={() => {
                                    const items =
                                      form.getValues(`sections.${idx}.items`) ||
                                      [];
                                    form.setValue(`sections.${idx}.items`, [
                                      ...items,
                                      {
                                        heading: "",
                                        subheading: "",
                                        start: "",
                                        end: "",
                                        bullets: [],
                                        meta: "",
                                        positions: [],
                                      },
                                    ]);
                                  }}
                                  className="w-full"
                                >
                                  + Add Timeline Item
                                </Button>
                              </div>
                            </div>
                          )}

                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => sectionsArray.remove(idx)}
                            className="w-full"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Section
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
                <Button
                  type="button"
                  onClick={() =>
                    sectionsArray.append({
                      key: "new",
                      title: "New Section",
                      placement: "right",
                      order: 99,
                      type: "rich",
                      content: "",
                    })
                  }
                  className="w-full"
                >
                  + Add Section
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Layout Section */}
          <AccordionItem value="layout" className="border rounded-lg">
            <AccordionTrigger className="px-4">
              <span className="font-semibold">Layout</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Left Width %</Label>
                  <Input
                    type="number"
                    min="20"
                    max="50"
                    {...form.register("layout.leftWidth", {
                      valueAsNumber: true,
                    })}
                    placeholder="30"
                  />
                </div>
                <div>
                  <Label>Right Width %</Label>
                  <Input
                    type="number"
                    min="50"
                    max="80"
                    {...form.register("layout.rightWidth", {
                      valueAsNumber: true,
                    })}
                    placeholder="70"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Copy Resume Data Section */}
          <AccordionItem value="copy" className="border rounded-lg">
            <AccordionTrigger className="px-4">
              <span className="font-semibold">Copy Resume Data</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Copy your resume data to clipboard for backup or sharing.
                </p>
                <Button
                  type="button"
                  onClick={handleCopyResumeData}
                  className="w-full"
                  variant="outline"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Resume Data
                    </>
                  )}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </ScrollArea>
  );
}
