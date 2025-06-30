'use client';

import { useState } from 'react';
import { Lightbulb, Loader2, File } from 'lucide-react';
import { suggestRelevantFiles } from '@/ai/flows/suggest-relevant-files';
import { availableFiles } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface AiFileSuggesterProps {
  conversationHistory: string;
}

export function AiFileSuggester({ conversationHistory }: AiFileSuggesterProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSuggestFiles = async () => {
    setIsLoading(true);
    setSuggestions([]);
    try {
      const result = await suggestRelevantFiles({
        conversationHistory,
        availableFiles,
      });
      setSuggestions(result.suggestedFiles);
    } catch (error) {
      console.error('Error suggesting files:', error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Could not fetch file suggestions.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-2 pt-2 border-t">
      <div className="flex items-center gap-2">
         <Button
            onClick={handleSuggestFiles}
            variant="ghost"
            size="sm"
            disabled={isLoading}
            className="text-sm text-muted-foreground"
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
                <Lightbulb className="h-4 w-4 mr-2" />
            )}
            AI File Suggestions
        </Button>
      </div>

      {suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {suggestions.map((file) => (
            <Badge
              key={file}
              variant="secondary"
              className="cursor-pointer hover:bg-accent"
              onClick={() => {
                // Logic to attach the file to the message
                toast({
                  title: 'File Attached',
                  description: `${file} has been added to your message.`,
                });
              }}
            >
              <File className="h-3 w-3 mr-1" />
              {file}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
