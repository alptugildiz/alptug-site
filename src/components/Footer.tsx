export default function Footer() {
  return (
    <footer className=" py-4 px-4 sm:px-8 text-sm text-right text-black dark:text-white z-10 relative bg-transparent" style={{width:'250px', float:'right'}}>
      <p>
        © 2025 –{" "}
        <a
          href="https://alptugildiz.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:opacity-80 transition-opacity"
        >
          alptugildiz.com
        </a>
      </p>
    </footer>
  );
}
