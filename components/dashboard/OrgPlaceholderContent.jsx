"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function OrgPlaceholderContent({
  title = "Coming Soon",
  description = "This section is under development",
}) {
  return (
    <div className="mt-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {title}
            <Badge variant="outline">Coming Soon</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 text-4xl">🚧</div>
            <h3 className="mb-2 text-lg font-semibold">{title}</h3>
            <p className="max-w-md mb-4 text-muted-foreground">{description}</p>
            <Button variant="outline" disabled>
              Feature in Development
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
