"use client";

import type { Workstream } from "@/lib/concept/model";
import { Card, DocumentList } from "./ui";
import { ProjectsTable } from "./ProjectsTable";

/** Estimates tab, with the files card that used to be its own tab. */
export function EstimatesPanel({
  w,
  readOnly,
}: {
  w: Workstream;
  /** Inherited from `from` package: no customer actions on estimates or files. */
  readOnly?: boolean;
}) {
  const estimated = w.projects.filter((project) => project.estimate);
  const estimateDocs = (w.documents ?? []).filter((doc) =>
    /estimate/i.test(doc.name),
  );
  const yourFiles = (w.documents ?? []).filter(
    (doc) => !/estimate/i.test(doc.name),
  );
  return (
    <>
      <Card title="Estimates" bodyClassName="p-0">
        <ProjectsTable
          w={w}
          rows={estimated}
          columns={["estimate", "decision"]}
          readOnly={readOnly}
        />
        {estimateDocs.length > 0 && (
          <div className="border-t border-border-light px-6">
            <DocumentList docs={estimateDocs} readOnly={readOnly} />
          </div>
        )}
      </Card>
      <Card title="Your files">
        {yourFiles.length > 0 ? (
          <DocumentList docs={yourFiles} readOnly={readOnly} />
        ) : (
          <p className="p6 text-text-secondary">No files yet</p>
        )}
      </Card>
    </>
  );
}
