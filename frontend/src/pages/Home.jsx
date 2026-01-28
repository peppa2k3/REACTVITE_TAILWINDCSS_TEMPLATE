import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Download, ArrowRight } from 'lucide-react';
import { userAPI, projectsAPI } from '../services/api';

const Home = () => {
  const [user, setUser] = useState(null);
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, projectsData] = await Promise.all([
          userAPI.getUser(),
          projectsAPI.getProjects(true, 3),
        ]);
        setUser(userData);
        setFeaturedProjects(projectsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-20">
      {/* Hero Section */}
      <section className="relative">
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-3xl p-1 shadow-2xl">
          <div className="bg-white rounded-3xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition"></div>
                <img
                  src={user?.avatar || '/api/placeholder/200/200'}
                  alt="Avatar"
                  className="relative w-40 h-40 md:w-48 md:h-48 rounded-full object-cover border-4 border-white"
                />
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {user?.firstname} {user?.lastname}
                </h1>
                <p className="text-2xl md:text-3xl text-gray-600 font-medium">
                  {user?.jobs || 'Fullstack Developer'}
                </p>
                <p className="text-gray-600 text-lg max-w-2xl">
                  {user?.another ||
                    'Đam mê xây dựng các ứng dụng web tối ưu và trải nghiệm người dùng mượt mà.'}
                </p>

                {/* Social Links */}
                <div className="flex justify-center md:justify-start gap-4 pt-4">
                  {user?.contact?.github && (
                    <a
                      href={user.contact.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition transform hover:scale-105 shadow-lg"
                    >
                      <Github size={20} />
                      GitHub
                    </a>
                  )}
                  {user?.contact?.linkedin && (
                    <a
                      href={user.contact.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition transform hover:scale-105 shadow-lg"
                    >
                      <Linkedin size={20} />
                      LinkedIn
                    </a>
                  )}
                  <a
                    href="/cv.pdf"
                    download
                    className="flex items-center gap-2 border-2 border-purple-600 text-purple-600 px-6 py-3 rounded-full font-semibold hover:bg-purple-600 hover:text-white transition transform hover:scale-105 shadow-lg"
                  >
                    <Download size={20} />
                    Download CV
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-4xl font-bold text-gray-900">
            Featured{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Projects
            </span>
          </h2>
          <Link
            to="/projects"
            className="flex items-center gap-2 text-blue-600 font-semibold hover:gap-4 transition-all"
          >
            View All <ArrowRight size={20} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProjects.map((project) => (
            <Link
              key={project._id}
              to={`/projects/${project._id}`}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden">
                {project.images?.image1 ? (
                  <img
                    src={project.images.image1}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                    {project.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="p-6 space-y-3">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold uppercase">
                  {project.type}
                </span>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition">
                  {project.name}
                </h3>
                <p className="text-gray-600 line-clamp-2">{project.maindesc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
