import MainLayout from '../../components/layout/MainLayout';
import Link from 'next/link';

export default function About() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="backdrop-blur-2xl bg-white/10 rounded-3xl p-12 border border-white/20 shadow-2xl">
              <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  Despre
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Comunitatea Noastra
                </span>
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-8 rounded-full"></div>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                O comunitate moderna care imbratiseaza tehnologia pentru o viata mai buna la bloc
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Mission */}
            <div className="backdrop-blur-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl p-8 border border-blue-500/20 shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
              <div className="text-5xl mb-6">🎯</div>
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Misiunea Noastra
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Cream o comunitate moderna si transparenta, unde fiecare locatar are 
                acces usor la informatiile importante si poate participa activ la 
                viata asociatiei.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Prin tehnologie si inovatie, transformam administrarea traditionala 
                intr-o experienta digitala sigura si eficienta.
              </p>
            </div>

            {/* Vision */}
            <div className="backdrop-blur-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl p-8 border border-purple-500/20 shadow-2xl hover:shadow-purple-500/10 transition-all duration-500">
              <div className="text-5xl mb-6">🔮</div>
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Viziunea Noastra
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Sa fim modelul asociatiei de proprietari moderne din Romania, 
                care foloseste tehnologia pentru transparenta si eficienta.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Credem intr-un viitor in care administrarea blocurilor este 
                complet digitalizata, transparenta si accesibila tuturor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Valorile
              </span>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}Noastre
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Principiile care ne ghideaza in tot ceea ce facem
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "👁️",
                title: "Transparenta",
                description: "Toate informatiile sunt accesibile si clare pentru fiecare locatar.",
                gradient: "from-blue-500/10 to-cyan-500/10",
                border: "border-blue-500/20"
              },
              {
                icon: "⚡",
                title: "Eficienta",
                description: "Procese rapide si automatizate pentru economisirea timpului tuturor.",
                gradient: "from-green-500/10 to-emerald-500/10",
                border: "border-green-500/20"
              },
              {
                icon: "🤝",
                title: "Comunitate",
                description: "Construim relatii puternice intre vecini si administrație.",
                gradient: "from-purple-500/10 to-pink-500/10",
                border: "border-purple-500/20"
              },
              {
                icon: "🛡️",
                title: "Securitate",
                description: "Datele personale si financiare sunt protejate cu tehnologie avansata.",
                gradient: "from-red-500/10 to-orange-500/10",
                border: "border-red-500/20"
              },
              {
                icon: "📱",
                title: "Inovatie",
                description: "Adoptam tehnologii noi pentru a imbunatati experienta locatarilor.",
                gradient: "from-indigo-500/10 to-blue-500/10",
                border: "border-indigo-500/20"
              },
              {
                icon: "🌱",
                title: "Sustenabilitate",
                description: "Promovam practici ecologice si economii de resurse.",
                gradient: "from-teal-500/10 to-green-500/10",
                border: "border-teal-500/20"
              }
            ].map((value, index) => (
              <div
                key={index}
                className={`backdrop-blur-2xl bg-gradient-to-br ${value.gradient} rounded-3xl p-8 border ${value.border} hover:border-white/30 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 shadow-lg hover:shadow-2xl group`}
              >
                <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors duration-300">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Echipa
              </span>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}Noastra
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Profesioniștii dedicati care fac posibila aceasta experienta
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Ana Popescu",
                role: "Administrator",
                description: "15 ani experienta in administrarea condominiilor",
                avatar: "👩‍💼",
                gradient: "from-blue-500/10 to-cyan-500/10",
                border: "border-blue-500/20"
              },
              {
                name: "Mihai Ionescu",
                role: "Contabil",
                description: "Expert in fiscalitate si gestiune financiara",
                avatar: "👨‍💻",
                gradient: "from-green-500/10 to-emerald-500/10",
                border: "border-green-500/20"
              },
              {
                name: "Elena Dumitrescu",
                role: "Tehnician",
                description: "Mentenanta si reparatii in tot blocul",
                avatar: "👩‍🔧",
                gradient: "from-purple-500/10 to-pink-500/10",
                border: "border-purple-500/20"
              }
            ].map((member, index) => (
              <div
                key={index}
                className={`backdrop-blur-2xl bg-gradient-to-br ${member.gradient} rounded-3xl p-8 border ${member.border} hover:border-white/30 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 shadow-lg hover:shadow-2xl group text-center`}
              >
                <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {member.avatar}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-medium mb-4">{member.role}</p>
                <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="backdrop-blur-2xl bg-gradient-to-br from-white/20 to-white/10 rounded-3xl p-12 border border-white/20 shadow-2xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Statistici Asociatie
              </h2>
              <p className="text-xl text-gray-600">Cifrele care ne definesc comunitatea</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              {[
                { number: "124", label: "Apartamente", color: "from-blue-500 to-cyan-500" },
                { number: "8", label: "Etaje", color: "from-green-500 to-emerald-500" },
                { number: "1987", label: "Anul constructiei", color: "from-purple-500 to-pink-500" },
                { number: "98%", label: "Satisfactia locatarilor", color: "from-orange-500 to-red-500" }
              ].map((stat, index) => (
                <div key={index} className="group">
                  <div className={`text-4xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300`}>
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="backdrop-blur-2xl bg-gradient-to-br from-white/20 to-white/10 rounded-3xl p-16 border border-white/20 shadow-2xl">
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Alatura-te
              </span>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}Comunitatii
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Fii parte din aceasta transformare digitala si bucura-te de 
              beneficiile unei administrarii moderne si transparente.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center px-12 py-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              Intra in platforma
              <svg className="ml-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}