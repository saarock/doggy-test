// components/UserbackWidget.tsx
"use client";

import { useEffect } from "react";
import Userback from "@userback/widget";

type UserbackWidgetProps = {
  userId?: string;
  name?: string;
  email?: string;
};

export default function UserbackWidget({ userId, name, email }: UserbackWidgetProps) {
  useEffect(() => {
    const options = {
      user_data: {
        id: userId,
        info: { name, email },
      },
    };

    // initialize Userback in the browser
    Userback("A-PuRUOeeAIG5losu35T8yFQVrR", options);
  }, [userId, name, email]);

  return null; // widget injects itself, no visible element
}
