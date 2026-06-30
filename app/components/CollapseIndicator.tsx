import styles from "./CollapseIndicator.module.css";

interface Props {
  open: boolean;
  size: "large" | "medium" | "small";
}

export function CollapseIndicator({ open, size }: Props) {
  const sizeClass = {
    large: styles.largeSize,
    medium: styles.mediumSize,
    small: styles.smallSize,
  };
  return (
    <div className={`${open ? styles.expanded : styles.collapsed} ${sizeClass[size]}`}>
      <svg
        className={styles.triangle}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="-0.5 0 8 8"
        fill="white"
      >
        <path fillRule="evenodd" d="M0 0v8l7-4z"></path>
      </svg>
    </div>
  );
}
