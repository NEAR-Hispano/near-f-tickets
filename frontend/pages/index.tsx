import React from 'react';
import Landing from '../components/Landing/Landing';
import Layout from '../components/Landing/Layout';

export default function index() {
  return (
    <div className="min-h-screen min-w-screen bg-figma-200">
      <Layout>
        <Landing />
      </Layout>
    </div>
  );
}
