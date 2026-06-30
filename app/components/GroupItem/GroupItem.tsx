import { useState } from "react";
import type { SiteGroup } from "@scribe-atp/core";
import { CollapseIndicator } from "../CollapseIndicator";
import { ArticleItem } from "../ArticleItem/ArticleItem";
import styles from "./GroupItem.module.css";

interface Props {
  group: SiteGroup;
  author: string;
}

export function GroupItem({ group, author }: Props) {
  const [open, setOpen] = useState(true);
  return (
    <li className={styles.groupItem}>
      <div className={styles.header}>
        <button
          onClick={() => setOpen((o) => !o)}
          className={styles.toggle}
          aria-label={open ? "Collapse group" : "Expand group"}
        >
          <CollapseIndicator size="medium" open={open} />
          <span className={styles.title}>
            {group.title}
            <span className={styles.count}>({group.articles.length})</span>
          </span>
        </button>
      </div>
      {open && group.articles.length > 0 && (
        <ul className={styles.list}>
          {group.articles.map((a) => (
            <li key={a.uri} className={styles.article}>
              <ArticleItem article={a} author={author} />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
