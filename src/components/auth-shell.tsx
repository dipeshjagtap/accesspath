import { CheckCircle2 } from "lucide-react";
import Image from "next/image";

import authImage from "../../public/images/auth-illustration.jpg";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="bg-secondary/50 section-x flex flex-1 items-center py-12">
      <div className="bg-card ring-border mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl shadow-2xl ring-1 lg:grid-cols-2">
        <div className="relative hidden flex-col justify-between overflow-hidden bg-[#0a6b61] p-10 text-white lg:flex">
          <div className="relative z-10 space-y-3">
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-white/80">{subtitle}</p>
          </div>
          <Image
            src={authImage}
            alt=""
            className="relative z-0 mx-auto my-6 max-h-[360px] w-auto rounded-2xl object-contain"
            sizes="400px"
            placeholder="blur"
          />
          <ul className="relative z-10 space-y-2 text-sm text-white/85">
            {[
              "Your details are shared only with consent",
              "Verified organisations, reviewed by admins",
              "Track every request in one place",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle2
                  className="size-4 text-[#9fe3d6]"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-6 sm:p-10">{children}</div>
      </div>
    </main>
  );
}
