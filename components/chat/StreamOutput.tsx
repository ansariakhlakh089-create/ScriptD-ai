export default function StreamOutput({ data }: { data: string }) {
  return <div className="p-4 bg-gray-900 rounded-xl">{data}</div>;
}
