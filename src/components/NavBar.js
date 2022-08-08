import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';

import './NavBar.css';

export default function NavBar() {
  const navLinkTitles = [
    'Bar Chart',
    'Scatterplot Graph',
    'Heat Map',
    'Choropleth Map',
    'Treemap Diagram',
  ];

  const dropdownNavlinks = navLinkTitles.map((title, index) => {
    return (
      <li key={title}>
        <a
          className="dropdown-item"
          href={`https://plcoster.github.io/fcc_datavis_project${index + 1}/`}
        >
          {title}
        </a>
      </li>
    );
  });

  return (
    <nav className="navbar navbar-expand-md navbar-light bg-info">
      <div className="container-fluid">
        <a className="navbar-brand" href=".">
          Choropleth
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavDropdown">
          <ul className="navbar-nav">
            <li className="nav-item">
              <a
                className="nav-link active"
                href="https://plcoster.github.io/homepage/"
              >
                Home
              </a>
            </li>
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="navbarDropdownMenuLink"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                FreeCodeCamp DataVis Projects
              </a>
              <ul
                className="dropdown-menu"
                aria-labelledby="navbarDropdownMenuLink"
              >
                {dropdownNavlinks}
              </ul>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                href="https://plcoster.github.io/homepage/projects.html"
              >
                All Projects
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="https://github.com/PLCoster">
                <FontAwesomeIcon icon={faGithub} /> Github
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="https://linkedin.com/in/plcoster">
                <FontAwesomeIcon icon={faLinkedin} /> LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
