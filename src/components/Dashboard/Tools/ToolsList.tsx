import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTemplates, getTools } from "@/api/apiEndpoints";
import { Link, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import IsLoading from "@/components/IsLoading";
import type { Template, Tool } from "@/types";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface Props {
  hot?: boolean;
}

interface GroupedTools {
  [toolId: string]: {
    tool: Tool;
    templates: Template[];
  };
}

export default function ToolsList({ hot }: Props) {
  const [tools, setTools] = useState<Template[]>([]);
  const [query, setQuery] = useState("");
  const pathname = useLocation().pathname;

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ["tools", `${hot && "hot"}`],
    queryFn: () => getTemplates(hot),
  });

  const { data: toolCategories, isLoading: toolsLoading } = useQuery({
    queryKey: ["tool-categories"],
    queryFn: () => getTools(),
  });

  useEffect(() => {
    if (templates) setTools(templates);
  }, [templates]);

  const filteredTools = tools.filter((tool) =>
    tool.name.toLowerCase().includes(query.toLowerCase())
  );

  // Group templates by their tool category
  const groupedTools: GroupedTools = {};
  
  if (toolCategories && filteredTools.length > 0) {
    filteredTools.forEach((template) => {
      const toolId = template.tool;
      if (toolId) {
        const toolCategory = toolCategories.find(t => t.id === toolId);
        if (toolCategory) {
          if (!groupedTools[toolId]) {
            groupedTools[toolId] = {
              tool: toolCategory,
              templates: []
            };
          }
          groupedTools[toolId].templates.push(template);
        }
      }
    });
  }

  const isLoading = templatesLoading || toolsLoading;

  return (
    <div className="space-y-10">
      {/* Search Box */}
      {!hot && (
        <div className="flex justify-center bg-gradient-to-b  from-background to-white/5  border-white/10 px-4 py-5 border">
          <div className="flex flex-col sm:flex-row items-center  w-full relative">
            <Input
              type="text"
              placeholder="Search tools..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-5 py-3 h-fit border border-white/30 rounded-full"
            />
            <Button className="w-fit rounded-full  absolute right-0 top-0 bottom-0 bg-white/10 hover:bg-white/20 text-white m-1 mr-2">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Grouped Tool Sections */}
      {Object.keys(groupedTools).length > 0 ? (
        <div className="space-y-12">
          {Object.entries(groupedTools).map(([toolId, { tool, templates }]) => (
            <div key={toolId} className="space-y-6">
              {/* Tool Category Header */}
              <div className="border-b border-white/20 pb-2">
                <h2 className="text-2xl font-bold text-white mb-2">{tool.name}</h2>
                <div className="w-full h-px bg-gradient-to-r from-white/20 via-white/40 to-white/20"></div>
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {templates.map((template) => (
                  <Link
                    to={`/${pathname.includes("all-tools") ? "all-tools" : "tools"}/${
                      template.id
                    }`}
                    key={template.id}
                    className="relative h-[400px] rounded-xl overflow-hidden border border-white/20 bg-white/5 backdrop-blur-sm p-5"
                  >
                    {/* Banner Preview */}
                    <div
                      className="absolute inset-0 p-2 pointer-events-none z-0"
                      style={{
                        WebkitMaskImage:
                          "linear-gradient(to bottom, black 60%, transparent 100%)",
                        maskImage:
                          "linear-gradient(to bottom, black 60%, transparent 100%)",
                      }}
                    >
                      {template.banner ? (
                        <div className="mask-b-to-[80%] h-full bg-white rounded-lg overflow-hidden">
                          <img
                            src={template.banner}
                            alt={`${template.name} banner`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-black/10">
                          No Preview
                        </div>
                      )}
                    </div>

                    {/* Bottom Overlay */}
                    <div className="absolute bottom-0 left-0 w-full z-10 bg-transparent p-4 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <h3 className="text-white font-semibold truncate">
                          {template.name}
                        </h3>
                        <span className="text-xs text-white/80 bg-white/10 px-2 py-1 rounded-full capitalize">
                          {template?.hot ? "Hot Tool 🔥" : "Template"}
                        </span>
                      </div>

                      <Link
                        to={`/${
                          pathname.includes("all-tools") ? "all-tools" : "tools"
                        }/${template.id}`}
                        className="w-full mt-2"
                      >
                        <button className="w-full px-4 py-2 rounded-md bg-primary text-background font-medium hover:bg-primary/90 transition">
                          Use Template
                        </button>
                      </Link>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* No Match */
        !isLoading && (
          <p className="text-center text-gray-500">
            No tools found.
          </p>
        )
      )}
      
      {isLoading && <IsLoading />}
    </div>
  );
}
