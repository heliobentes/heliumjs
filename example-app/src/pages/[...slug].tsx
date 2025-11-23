import { useRouter } from "helium/client";

export default function DynamicSlugPage({ params }: { params: { slug: string[] } }) {
    const router = useRouter();
    console.log("🚀 ~ DynamicSlugPage ~ router:", router);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">Dynamic Slug Page</h1>
            <p className="text-gray-600">
                You are viewing the page for slug: <strong>{params.slug.join(" <=> ")}</strong>
            </p>
        </div>
    );
}
