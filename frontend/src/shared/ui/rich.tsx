/** Renders a dictionary title pair as one plain heading; emphasis comes from the heading itself. */
export function Rich({ parts }: { parts: [string, string] }) {
  return <>{parts.join("")}</>;
}
