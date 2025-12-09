function generateSphereVertices(radius = 1, detail = 1) {
    const vertices = [];
    const normals = [];
    const texCoords = [];

    const latitudeBands = 8 * detail;
    const longitudeBands = 8 * detail;

    for (let lat = 0; lat < latitudeBands; lat++) {
        const theta1 = lat * Math.PI / latitudeBands;
        const theta2 = (lat + 1) * Math.PI / latitudeBands;

        const sin1 = Math.sin(theta1), cos1 = Math.cos(theta1);
        const sin2 = Math.sin(theta2), cos2 = Math.cos(theta2);

        for (let lon = 0; lon < longitudeBands; lon++) {
            const phi1 = lon * 2 * Math.PI / longitudeBands;
            const phi2 = (lon + 1) * 2 * Math.PI / longitudeBands;

            const sinp1 = Math.sin(phi1), cosp1 = Math.cos(phi1);
            const sinp2 = Math.sin(phi2), cosp2 = Math.cos(phi2);

            const v1 = [radius * cosp1 * sin1, radius * cos1, radius * sinp1 * sin1];
            const v2 = [radius * cosp1 * sin2, radius * cos2, radius * sinp1 * sin2];
            const v3 = [radius * cosp2 * sin2, radius * cos2, radius * sinp2 * sin2];
            const v4 = [radius * cosp2 * sin1, radius * cos1, radius * sinp2 * sin1];

            const t1 = [lon / longitudeBands, lat / latitudeBands];
            const t2 = [lon / longitudeBands, (lat + 1) / latitudeBands];
            const t3 = [(lon + 1) / longitudeBands, (lat + 1) / latitudeBands];
            const t4 = [(lon + 1) / longitudeBands, lat / latitudeBands];

            // Triangle 1
            vertices.push(...v1, ...v3, ...v2);
            normals.push(...normalizeVec(v1), ...normalizeVec(v3), ...normalizeVec(v2));
            texCoords.push(...t1, ...t3, ...t2);

            // Triangle 2
            vertices.push(...v1, ...v4, ...v3);
            normals.push(...normalizeVec(v1), ...normalizeVec(v4), ...normalizeVec(v3));
            texCoords.push(...t1, ...t4, ...t3);
        }
    }

    return {
        vertices,
        normals,
        texCoords
    };
}

function normalizeVec(vec) {
    const len = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
    if (len === 0) return [0, 0, 0];
    return [vec[0] / len, vec[1] / len, vec[2] / len];
}

const cubeVertices = [
    // Front
     -1, -1,  1,
      1, -1,  1,
      1,  1,  1,

     -1, -1,  1,
      1,  1,  1,
     -1,  1,  1,

    // Back
      1, -1, -1,
     -1, -1, -1,
     -1,  1, -1,

      1, -1, -1,
     -1,  1, -1,
      1,  1, -1,

    // Left
     -1, -1, -1,
     -1, -1,  1,
     -1,  1,  1,

     -1, -1, -1,
     -1,  1,  1,
     -1,  1, -1,

    // Right
      1, -1,  1,
      1, -1, -1,
      1,  1, -1,

      1, -1,  1,
      1,  1, -1,
      1,  1,  1,

    // Top
     -1,  1,  1,
      1,  1,  1,
      1,  1, -1,

     -1,  1,  1,
      1,  1, -1,
     -1,  1, -1,

    // Bottom
     -1, -1, -1,
      1, -1, -1,
      1, -1,  1,

     -1, -1, -1,
      1, -1,  1,
     -1, -1,  1
];