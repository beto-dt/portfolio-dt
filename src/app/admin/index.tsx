import Head from 'expo-router/head';
import { AdminScreen } from '@/admin/screens/admin-screen';

export default function Admin() {
  return (
    <>
      <Head>
        <title>Console — Luis De La Torre</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AdminScreen />
    </>
  );
}
