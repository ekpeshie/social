import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PostEditor } from "@/components/post-editor"
import type { Idea } from "@/lib/types"

export function IdeaCard({ date, idea }: { date: string; idea: Idea }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{idea.kind === "news" ? "In the news" : "From your expertise"}</Badge>
        </div>
        <CardTitle className="text-lg">{idea.topic}</CardTitle>
        <CardDescription className="text-pretty">
          {idea.angle} {idea.whyNow}
          {idea.sourceUrl && (
            <>
              {" "}
              <a
                href={idea.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-foreground underline underline-offset-4"
              >
                Source
              </a>
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="linkedin">
          <TabsList>
            <TabsTrigger value="linkedin">
              LinkedIn
            </TabsTrigger>
            <TabsTrigger value="x">
              X
            </TabsTrigger>
          </TabsList>
          <TabsContent value="linkedin" className="pt-3">
            <PostEditor
              date={date}
              ideaId={idea.id}
              platform="linkedin"
              initial={[idea.linkedin.text]}
              status={idea.linkedin.status}
            />
          </TabsContent>
          <TabsContent value="x" className="pt-3">
            <PostEditor date={date} ideaId={idea.id} platform="x" initial={idea.x.posts} status={idea.x.status} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
