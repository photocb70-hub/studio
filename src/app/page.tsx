
import fs from 'fs';
import path from 'path';
import HomeClientPage from '@/components/home-client-page';

// This is a server component, so we can read the file system.
const getChangelogContent = () => {
  const changelogPath = path.join(process.cwd(), 'CHANGELOG.txt');
  try {
    return fs.readFileSync(changelogPath, 'utf8');
  } catch (error) {
    console.error("Could not read changelog file:", error);
    return 'Changelog not available.';
  }
};

export default function Home() {
  const changelogContent = getChangelogContent();

  return <HomeClientPage changelogContent={changelogContent} />;
}
