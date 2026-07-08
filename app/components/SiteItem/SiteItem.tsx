import { useState } from "react";
import { Link } from "react-router";
import type { SiteRecord } from "@scribe-atp/core";
import { CollapseIndicator } from "../CollapseIndicator";
import { GroupItem } from "../GroupItem/GroupItem";
import styles from "./SiteItem.module.css";

interface Props {
  site: SiteRecord;
  author: string;
}

export function SiteItem({ site, author }: Props) {
  const [open, setOpen] = useState(true);
  return (
    <div className={styles.site}>
      <div className={styles.header}>
        <button
          onClick={() => setOpen((o) => !o)}
          className={styles.toggle}
          aria-label={open ? "Collapse site" : "Expand site"}
        >
          <CollapseIndicator open={open} size="large" />
          <span className={styles.name}>{site.title}</span>
        </button>
        <Link to={`/${author}/site.standard.publication/${site.url}`}>
          <span className={styles.url}>{site.url}</span>
        </Link>
      </div>
      {open && (
        <ul className={styles.list}>
          {site.groups.map((group) => (
            <GroupItem key={group.slug} group={group} author={author} />
          ))}
        </ul>
      )}
    </div>
  );
}
