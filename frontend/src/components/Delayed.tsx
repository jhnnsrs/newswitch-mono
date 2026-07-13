import { useEffect, useState } from "react";

export const Delayed = ({
  children,
  waitBeforeShow = 1000,
}: {
  children: React.ReactNode;
  waitBeforeShow?: number;
}) => {
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    // Set a timer to flip the state after the delay
    const timer = setTimeout(() => {
      setIsShown(true);
    }, waitBeforeShow);

    // Clean up the timer if the component unmounts
    // This prevents the state update if the parent stops rendering this
    return () => clearTimeout(timer);
  }, [waitBeforeShow]);

  return isShown ? children : null;
};
