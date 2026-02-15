"use client";
import { useRouter } from "next/navigation";

export default function HomePage() {
    const router = useRouter();
    return (
        <main className="min-h-[calc(100vh-72px)] bg-white flex flex-col">

        {/* Hero */}
        <section className="relative h-[360px] w-full">
            <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url(planting_tree.webp)" }}
            />
            {/* dark overlay */}
            <div className="absolute inset-0 bg-black/10" />

            {/* big HOME text */}
            <div className="relative mx-auto flex h-full max-w-6xl items-end pb-35">
            <h1 className="text-6xl font-bold tracking-wide text-white drop-shadow-md">
                HOME
            </h1>
            </div>
        </section>

        {/* Body */}
        <section className="mx-auto max-w-6xl px-6 py-20 text-center">
            <h2 className="text-4xl font-medium text-gray-900">
            Find helpful community resources near you in the Santa Clara area
            </h2>

            <div className="mx-auto my-10 h-[2px] w-[70%] bg-gray-300" />

            <p className="mx-auto max-w-4xl text-lg leading-relaxed text-gray-800">
            <span className="font-medium">
                Support for your journey, all in one place.
            </span>{" "}
            There’s no judgment, just help.
            <br />
            Click button below to connect with free food, healthcare, job
            opportunities, and legal aid in your community.
            </p>

            <button
                onClick={() => router.push("/search")}
                className="w-[560px] mt-16 max-w-full rounded-full border border-blue-300 bg-sky-100 px-10 py-5 text-sm font-semibold tracking-[0.35em] text-blue-900 shadow-sm hover:bg-sky-200 text-center transition-all duration-300 hover:scale-105"
            >
                FIND RESOURCE NEAR ME
            </button>
        </section>

        {/* Bottom subtle bar */}
        <div className="h-10 w-full bg-slate-400/70" />
        </main>
    );
}
