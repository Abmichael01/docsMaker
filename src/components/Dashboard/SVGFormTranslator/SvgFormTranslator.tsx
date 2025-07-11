// components/SvgFormTranslator.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FormPanel from "./FormPanel";
import { useEffect, useState } from "react";
// import parseSvgToFormFields from "@/lib/utils/parseSvgToFormFields";
import useToolStore from "@/store/formStore";
import updateSvgFromFormData from "@/lib/utils/updateSvgFromFormData";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getPurchasedTemplate, getTemplate } from "@/api/apiEndpoints";
import type { FormField, PurchasedTemplate, Template } from "@/types";
import { Loader2Icon } from "lucide-react";

interface Props {
  isPurchased?: boolean;
}

export default function SvgFormTranslator({ isPurchased }: Props) {
  const [svgText, setSvgText] = useState<string>("");
  const [livePreview, setLivePreview] = useState<string>("");

  const { 
    setFields, 
    setSvgRaw, 
    setName, 
    setStatus, 
    fields, 
    setStatusMessage, 
  } = useToolStore();
  
  const { id } = useParams<{ id: string }>();

  // Fetch template data
  const { data, isLoading, error } = useQuery<PurchasedTemplate | Template>({
    queryKey: [isPurchased ? "purchased-template" : "template", id],
    queryFn: () =>
      isPurchased
        ? getPurchasedTemplate(id as string)
        : getTemplate(id as string),
    enabled: !!id, // Only run query if id exists
  });

  // Combined effect to handle data loading and state updates
  useEffect(() => {
    if (isLoading || !data) return;
    const newSvgText = data.svg as string;
    // Update all state in the correct order
    setSvgText(newSvgText);
    setSvgRaw(newSvgText);
    setName(data.name as string);
    setFields(data.form_fields as FormField[]);
    console.log('Template data loaded:', data);
    
  }, [
    data, 
    isLoading, 
    setSvgRaw, 
    setName, 
    setFields
  ]);

  const purchasedData = data as PurchasedTemplate;

  // Separate effect for status fields to avoid conflicts
  useEffect(() => {
    if (isLoading || !data) return;
    
    if (isPurchased) {
      
      
      // Use setTimeout to ensure other state updates complete first
      setTimeout(() => {
        console.log('Setting status:', purchasedData.status);
        console.log('Setting status message:', purchasedData.error_message);
        
        if (purchasedData.status !== undefined) {
          setStatus(purchasedData.status);
        }
        if (purchasedData.error_message !== undefined) {
          setStatusMessage(purchasedData.error_message as string);
        }
      }, 0);
    } else {
      // Clear status fields for regular templates
      setTimeout(() => {
        setStatus("");
        setStatusMessage("");
      }, 0);
    }
    
  }, [data, isLoading, isPurchased, setStatus, setStatusMessage]);

  // Update live preview when fields or svgText change
  useEffect(() => {
    if (!svgText || !fields || fields.length === 0) return;
    
    try {
      const updatedSvg = updateSvgFromFormData(svgText, fields);
      setLivePreview(updatedSvg);
    } catch (error) {
      console.error('Error updating SVG preview:', error);
      setLivePreview(svgText); // Fallback to original SVG
    }
  }, [fields, svgText]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 items-center justify-center h-100">
        <Loader2Icon className="size-6 animate-spin text-primary" />
        <h2 className="text-lg text-primary">
          {isPurchased ? "Loading Document..." : "Loading Tool..."}
        </h2>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex flex-col gap-5 items-center justify-center h-100">
        <h2 className="text-lg text-red-500">
          Error loading {isPurchased ? "document" : "tool"}
        </h2>
        <p className="text-sm text-gray-600">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
      </div>
    );
  }

  // Handle case where data is loaded but no SVG content
  if (!svgText) {
    return (
      <div className="flex flex-col gap-5 items-center justify-center h-100">
        <h2 className="text-lg text-yellow-600">
          No SVG content found
        </h2>
        <p className="text-sm text-gray-600">
          The template appears to be missing SVG data.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Tabs defaultValue="editor" className="w-full px-0">
        <TabsList className="bg-white/10 w-full">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="editor">
          <FormPanel test={purchasedData?.test} />
        </TabsContent>
        <TabsContent value="preview">
          <div className="w-full overflow-auto p-5 bg-white/10 border border-white/20 rounded-xl">
            <div className="min-w-[300px] inline-block max-w-full">
              <div
                className="[&_svg]:max-w-full [&_svg]:h-auto [&_svg]:w-full"
                dangerouslySetInnerHTML={{ __html: livePreview || svgText }}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}