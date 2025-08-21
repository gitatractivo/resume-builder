import { useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";

const contactSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  type: z.enum(["link", "phone", "email"]),
});

const timelineItemSchema = z.object({
  heading: z.string().min(1),
  subheading: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  bullets: z.array(z.string()).optional(),
  meta: z.string().optional(),
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

  return (
    <ScrollArea className="h-[calc(100vh-150px)] w-full" style={{ boxSizing: 'border-box' }}>
      <div className="space-y-4 w-full max-w-full" style={{ boxSizing: 'border-box' }}>
        <Card className="p-0 border-none w-full" style={{ boxSizing: 'border-box' }}>
          <CardHeader className="px-0">
            <CardTitle>Header</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-0 w-full" style={{ boxSizing: 'border-box' }}>
            <div className="w-full" style={{ boxSizing: 'border-box' }}>
              <Label>Full Name</Label>
              <Input {...form.register("meta.fullName")} className="w-full" style={{ boxSizing: 'border-box' }} />
            </div>
            <div className="w-full" style={{ boxSizing: 'border-box' }}>
              <Label>Title</Label>
              <Input {...form.register("meta.title")} className="w-full" style={{ boxSizing: 'border-box' }} />
            </div>

            <div>
              <Label>Contact Lines</Label>
              <div className="space-y-2">
                {contactArray.fields.map((f, idx) => (
                  <div
                    key={f.id}
                    className="border rounded-md p-2 space-y-2 w-full"
                    style={{ boxSizing: 'border-box' }}
                  >
                    <div className="w-full" style={{ boxSizing: 'border-box' }}>
                      <Label>Label</Label>
                      <Input
                        {...form.register(`meta.contact.${idx}.label`)}
                        placeholder="Label"
                        className="w-full"
                        style={{ boxSizing: 'border-box' }}
                      />
                    </div>
                    <div className="w-full" style={{ boxSizing: 'border-box' }}>
                      <Label>Value</Label>
                      <Input
                        {...form.register(`meta.contact.${idx}.value`)}
                        placeholder="Value"
                        className="w-full"
                        style={{ boxSizing: 'border-box' }}
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
                              <SelectValue placeholder="Type" />
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
                    <div>
                      <Button
                        variant="destructive"
                        type="button"
                        size="sm"
                        onClick={() => contactArray.remove(idx)}
                        className="p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
                >
                  + Add Contact
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-0 border-none w-full" style={{ boxSizing: 'border-box' }}>
          <CardHeader className="pl-0">
            <CardTitle>Sections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 w-full" style={{ boxSizing: 'border-box' }}>
            {sectionsArray.fields.map((f, idx) => {
              const type = form.watch(
                `sections.${idx}.type`
              ) as Section["type"];
                              return (
                  <div key={f.id} className="border p-2 rounded-md space-y-3" style={{ boxSizing: 'border-box' }}>
                    <div className="space-y-3 w-full" style={{ boxSizing: 'border-box' }}>
                    <div className="w-full" style={{ boxSizing: 'border-box' }}>
                      <Label>Key</Label>
                      <Input
                        {...form.register(`sections.${idx}.key`)}
                        placeholder="section-key"
                        className="w-full"
                        style={{ boxSizing: 'border-box' }}
                      />
                    </div>
                    <div className="w-full" style={{ boxSizing: 'border-box' }}>
                      <Label>Title</Label>
                      <Input
                        {...form.register(`sections.${idx}.title`)}
                        placeholder="Section Title"
                        className="w-full"
                        style={{ boxSizing: 'border-box' }}
                      />
                    </div>
                    <div className="w-full" style={{ boxSizing: 'border-box' }}>
                      <Label>Placement</Label>
                      <Controller
                        control={form.control}
                        name={`sections.${idx}.placement`}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full" style={{ boxSizing: 'border-box' }}>
                              <SelectValue placeholder="Column" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="w-full" style={{ boxSizing: 'border-box' }}>
                      <Label>Order</Label>
                      <Input
                        type="number"
                        {...form.register(`sections.${idx}.order`, {
                          valueAsNumber: true,
                        })}
                        placeholder="0"
                        className="w-full"
                        style={{ boxSizing: 'border-box' }}
                      />
                    </div>
                    <div className="w-full" style={{ boxSizing: 'border-box' }}>
                      <Label>Type</Label>
                      <Controller
                        control={form.control}
                        name={`sections.${idx}.type`}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full" style={{ boxSizing: 'border-box' }}>
                              <SelectValue placeholder="Type" />
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
                  </div>

                  {type === "rich" && (
                    <div>
                      <Label>Content</Label>
                      <Textarea
                        rows={5}
                        {...form.register(`sections.${idx}.content`)}
                      />
                    </div>
                  )}

                  {type === "grouped" && (
                    <div className="space-y-2">
                      <Label>Groups</Label>
                      <div className="space-y-4">
                        {form
                          .watch(`sections.${idx}.groups`)
                          ?.map((group, groupIdx) => (
                            <div
                              key={groupIdx}
                              className=" rounded-md space-y-2"
                            >
                              <div className="flex flex-col items-start gap-2">
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
                                  className="p-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div>
                                <Label>Group Name</Label>
                                <Input
                                  {...form.register(
                                    `sections.${idx}.groups.${groupIdx}.name`
                                  )}
                                />
                              </div>
                              <div>
                                <Label>Items</Label>
                                <div className="space-y-2">
                                  {group.items?.map((_item, itemIdx) => (
                                    <div
                                      key={itemIdx}
                                      className=" rounded-md p-2 space-y-2"
                                    >
                                      <Input
                                        {...form.register(
                                          `sections.${idx}.groups.${groupIdx}.items.${itemIdx}`
                                        )}
                                        className="flex-1"
                                      />
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => {
                                          const items = form.getValues(
                                            `sections.${idx}.groups.${groupIdx}.items`
                                          );
                                          items.splice(itemIdx, 1);
                                          form.setValue(
                                            `sections.${idx}.groups.${groupIdx}.items`,
                                            items
                                          );
                                        }}
                                        className="p-2"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
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
                              form.getValues(`sections.${idx}.groups`) || [];
                            form.setValue(`sections.${idx}.groups`, [
                              ...groups,
                              { name: "", items: [] },
                            ]);
                          }}
                        >
                          + Add Group
                        </Button>
                      </div>
                    </div>
                  )}

                  {type === "timeline" && (
                    <div className="space-y-2">
                      <Label>Timeline Items</Label>
                      <div className="space-y-4">
                        {form
                          .watch(`sections.${idx}.items`)
                          ?.map((item, itemIdx) => (
                            <div
                              key={itemIdx}
                              className=" rounded-md  space-y-3"
                            >
                              <div className="flex flex-col items-start gap-2">
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
                                  className="p-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label>Heading</Label>
                                  <Input
                                    {...form.register(
                                      `sections.${idx}.items.${itemIdx}.heading`
                                    )}
                                  />
                                </div>
                                <div>
                                  <Label>Subheading</Label>
                                  <Input
                                    {...form.register(
                                      `sections.${idx}.items.${itemIdx}.subheading`
                                    )}
                                  />
                                </div>
                                <div>
                                  <Label>Start Date</Label>
                                  <Input
                                    {...form.register(
                                      `sections.${idx}.items.${itemIdx}.start`
                                    )}
                                  />
                                </div>
                                <div>
                                  <Label>End Date</Label>
                                  <Input
                                    {...form.register(
                                      `sections.${idx}.items.${itemIdx}.end`
                                    )}
                                  />
                                </div>
                              </div>
                              <div>
                                <Label>Meta (optional)</Label>
                                <Input
                                  {...form.register(
                                    `sections.${idx}.items.${itemIdx}.meta`
                                  )}
                                />
                              </div>
                              <div>
                                <Label>Bullet Points</Label>
                                <div className="space-y-2">
                                  {(item.bullets || [])?.map(
                                    (_bullet, bulletIdx) => (
                                      <div
                                        key={bulletIdx}
                                        className=" rounded-md p-2 space-y-2"
                                      >
                                        <Input
                                          {...form.register(
                                            `sections.${idx}.items.${itemIdx}.bullets.${bulletIdx}`
                                          )}
                                          className="flex-1"
                                        />
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => {
                                            const bullets =
                                              form.getValues(
                                                `sections.${idx}.items.${itemIdx}.bullets`
                                              ) || [];
                                            bullets.splice(bulletIdx, 1);
                                            form.setValue(
                                              `sections.${idx}.items.${itemIdx}.bullets`,
                                              bullets
                                            );
                                          }}
                                          className="p-2"
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
                                          `sections.${idx}.items.${itemIdx}.bullets`
                                        ) || [];
                                      form.setValue(
                                        `sections.${idx}.items.${itemIdx}.bullets`,
                                        [...bullets, ""]
                                      );
                                    }}
                                  >
                                    + Add Bullet
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        <Button
                          type="button"
                          onClick={() => {
                            const items =
                              form.getValues(`sections.${idx}.items`) || [];
                            form.setValue(`sections.${idx}.items`, [
                              ...items,
                              {
                                heading: "",
                                subheading: "",
                                start: "",
                                end: "",
                                bullets: [],
                                meta: "",
                              },
                            ]);
                          }}
                        >
                          + Add Timeline Item
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => sectionsArray.remove(idx)}
                      className="p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
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
            >
              + Add Section
            </Button>
          </CardContent>
        </Card>

        <Card className="p-0 border-none w-full" style={{ boxSizing: 'border-box' }}>
          <CardHeader>
            <CardTitle>Raw JSON</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 w-full" style={{ boxSizing: 'border-box' }}>
            <Label>Full Resume JSON</Label>
            <Textarea
              rows={8}
              className="font-mono text-xs"
              value={JSON.stringify(form.getValues(), null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  form.reset(parsed);
                } catch {
                  // ignore invalid JSON while typing
                }
              }}
            />
          </CardContent>
        </Card>
        <Card className="p-0 border-none w-full" style={{ boxSizing: 'border-box' }}>
          <CardHeader>
            <CardTitle>Layout</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full" style={{ boxSizing: 'border-box' }}>
            <div>
              <Label>Left Width %</Label>
              <Input
                type="number"
                min="20"
                max="50"
                {...form.register("layout.leftWidth", { valueAsNumber: true })}
                placeholder="30"
              />
            </div>
            <div>
              <Label>Right Width %</Label>
              <Input
                type="number"
                min="50"
                max="80"
                {...form.register("layout.rightWidth", { valueAsNumber: true })}
                placeholder="70"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
