class BVH_AA_Node {

    constructor() {
        this.nodeID = -1;
        this.parentID = -1;
        this.hitLink = -1;
        this.missLink = -1;
        this.objectIndex = -1;
        this.type = -1;
        this.children = [];
        this.unassignedChildren = [];
        this.aabb = new AABB();
    }
}

/**
 * The BoundingVolumeHierarchy 
 */
class BVH_AA {

    /**
     * 
     * @param {string} name the name of the lod data
     */
    constructor() {
        console.log("Generate BVH_AA");
        this.nodes = [];
    }


    //std::vector<PositionData> &positionData
    //GL_LineSegment * lineSegments
    //int positions_size
    //int lineSegments_size
    //float tubeRadius
    //float maxCost
    //int growthID
    //float volume_threshold
    GenerateTree(positionData, lineSegments, tubeRadius, maxCost, growthID, volume_threshold) {
        console.log("GenerateTree, maxCost: " + maxCost);
        var r = glMatrix.vec4.fromValues(tubeRadius, tubeRadius, tubeRadius, 0);
        this.nodes = [];//nodes.clear();
        var nodeStack = [];//std::stack<int> nodeStack;

        //create root node
        var root = new BVH_AA_Node();//Node *root = new Node();
        root.type = 0;//0=parent
        root.nodeID = this.nodes.length;
        root.parentID = root.nodeID;
        this.nodes.push(root);
        for (var i = 0; i < lineSegments.length; i++) {
            var nodeLeaf = new BVH_AA_Node();
            nodeLeaf.type = 1;//1=lineSegment
            nodeLeaf.objectIndex = i;//i-th lineSegment
            nodeLeaf.nodeID = this.nodes.length;

            var segment = lineSegments[i];
            var data_a = positionData[segment.indexA];
            var data_b = positionData[segment.indexB];

            var filter_flag = false;
            if (maxCost != -1) {
                if (data_a.cost > maxCost)
                    filter_flag = true;

                //if selective growth, but a different id
                if (growthID != -1 && segment.multiPolyID != growthID)
                    filter_flag = false;

            }
            if (filter_flag)
                continue;

            //console.log("data_a.position: "+data_a.position);
            //console.log("data_b.position: "+data_b.position);
            //console.log("r: "+r);
            nodeLeaf.aabb.SetTube(data_a.position, data_b.position, r);
            root.unassignedChildren.push(nodeLeaf.nodeID);
            this.nodes.push(nodeLeaf);
        }
        nodeStack.push(0);

        if (root.unassignedChildren.length == 0) {
            console.log("root node has no children");
            return;
        }

        while (nodeStack.length > 0) {
            var nodeID = nodeStack.pop();
            var node = this.nodes[nodeID];

            //PrintNodes();
            this.CalculateCombinedAABB_fromUnassignedChildren(nodeID);
            var volume = node.aabb.GetVolume();
            //console.log("volume: ", volume, volume < volume_threshold);
            if (volume < volume_threshold) {
                this.AssignChildrenAsLeaves(node);
                continue;
            }

            var onlyLeaves = this.AssignChildren_splitAtCenter(nodeID);
            //console.log("onlyLeaves: ", onlyLeaves);
            //PrintNodes();

            if (onlyLeaves)
                continue;

            for (var i = 0; i < node.children.length; i++) {
                var childID = node.children[i];
                var child = this.nodes[childID];
                if (child.type == 0)
                    nodeStack.push(childID);
            }
        }

        console.log("GenerateTree completed: " + this.nodes.length + " nodes");
    }

    CalculateCombinedAABB_fromUnassignedChildren(nodeID) {
        //console.log("CalculateCombinedAABB_fromUnassignedChildren", nodeID);
        var node = this.nodes[nodeID];
        var toCombine = [];//std::vector<AABB*>
        for (var i = 0; i < node.unassignedChildren.length; i++) {
            var childID = node.unassignedChildren[i];
            //std::cout << "childID: " << childID << std::endl;
            var child = this.nodes[childID];
            toCombine.push(child.aabb);
        }
        node.aabb.Combine(toCombine);
        //console.log("node.aabb.min: " + node.aabb.min);
        //console.log("node.aabb.max: " + node.aabb.max);
    }

    //returns onlyLeaves
    AssignChildren_splitAtCenter(nodeID) {
        //console.log("AssignChildren_splitAtCenter: " + nodeID);
        //std::cout << "AssignChildren_splitAtCenter: " << nodeID << std::endl;
        var node = this.nodes[nodeID];
        var threshold = node.aabb.center;
        //console.log("threshold: " + threshold);
        return this.AssignChildren(node, threshold);
    }

    //returns onlyLeaves
    AssignChildren(node, threshold) {
        //std::cout << "AssignChildren" << std::endl;
        //create octant vector
        var octants = [];//vector<vector<int>>
        for (var i = 0; i < 8; i++) {
            var children = [];//vector<int>
            octants.push(children);
        }

        //assign children to octants
        for (var i = 0; i < node.unassignedChildren.length; i++) {
            var childID = node.unassignedChildren[i];
            var child = this.nodes[childID];
            var position = child.aabb.center;
            var octantIndex = this.GetOctantIndex(position, threshold);
            var octant = octants[octantIndex];
            octant.push(childID);
        }

        //check if all children fall in the same octant
        for (var i = 0; i < 8; i++) {
            var octant = octants[i];
            if (octant.length == node.unassignedChildren.length) {
                //TODO handle special case?
                //For now just put leaves directly
                for (var j = 0; j < octant.length; j++) {
                    var leafID = octant[j];
                    node.children.push(leafID);
                    var leaf = this.nodes[leafID];
                    leaf.parentID = node.nodeID;
                }
                node.unassignedChildren = [];//node.unassignedChildren.clear();               
                return true;//onlyLeaves = true;
            }
        }

        for (var i = 0; i < 8; i++) {
            var octant = octants[i];
            if (octant.length == 0)
                //octant contains no child --> ignore
                continue;
            if (octant.length == 1) {
                //octant contains exactly one child
                //--> just put leaf directly
                var leafID = octant[0];
                node.children.push(leafID);
                var leaf = this.nodes[leafID];
                leaf.parentID = node.nodeID;
                continue;
            }
            //octant contains more than one child
            //--> a new node is created and leaves are added to unassignedChildren
            var child = new BVH_AA_Node();
            child.nodeID = this.nodes.length;
            child.type = 0;//0=parent
            child.parentID = node.nodeID;
            this.nodes.push(child);
            for (var j = 0; j < octant.length; j++)
                child.unassignedChildren.push(octant[j]);
            node.children.push(child.nodeID);
        }

        node.unassignedChildren = [];
        return false;//onlyLeaves = false;
    }


    AssignChildrenAsLeaves(node) {
        for (var i = 0; i < node.unassignedChildren.length; i++) {
            var leafID = node.unassignedChildren[i];
            node.children.push(leafID);
            var leaf = this.nodes[leafID];
            leaf.parentID = node.nodeID;
        }
        node.unassignedChildren = [];//node.unassignedChildren.clear();
    }

    GetOctantIndex(position, threshold) {
        var difference = glMatrix.vec4.create();
        glMatrix.vec4.subtract(difference, position, threshold);//QVector4D difference = position - threshold;
        var x = (difference[0] > 0) ? 1 : 0;
        var y = (difference[1] > 0) ? 2 : 0;
        var z = (difference[2] > 0) ? 4 : 0;
        return x + y + z;
    }

    ConvertNodes() {
        var converted_nodes = new Array(this.nodes.length);
        for (var i = 0; i < this.nodes.length; i++) {
            var node = this.nodes[i];
            var converted_node = new TreeNode();
            converted_node.hitLink = this.GetHitLink(i);
            converted_node.missLink = this.GetRightSiblingUpwards(i);
            converted_node.segmentIndex = node.objectIndex;
            converted_node.type = node.type;
            converted_node.min = node.aabb.min;
            converted_node.max = node.aabb.max;
            //converted_node.min = glMatrix.vec4.fromValues(0,0,0,0);
            //converted_node.max = glMatrix.vec4.fromValues(1,1,1,1);
            converted_nodes[i] = converted_node;
        }
        return converted_nodes;
    }

    GetHitLink(nodeID) {
        var node = this.nodes[nodeID];
        if (node.type == 0) {
            //root without children
            if (node.children.length == 0)
                return -1;
            //node is parent --> return first child
            return node.children[0];
        }
        return this.GetRightSiblingUpwards(nodeID);
    }

    //finds the right sibling
    //if no right sibling exists finds right sibling in parent level
    //stops at root node where -1 is returned
    GetRightSiblingUpwards(nodeID) {
        //find right sibling
        var id_tmp = nodeID;
        while (true) {
            var node_tmp = this.nodes[id_tmp];
            var parentID = node_tmp.parentID;
            if (id_tmp == parentID)//at rootnode we stop
                return -1;
            var parent = this.nodes[parentID];
            var childIndex_tmp = GetIndexInList(id_tmp, parent.children);
            if (childIndex_tmp == -1) {
                var debug = 0;
            }
            if (childIndex_tmp == parent.children.length - 1) {
                //last child, go one level higher			
                id_tmp = parentID;
                continue;
            }
            //not last child --> return sibling
            var siblingID = parent.children[childIndex_tmp + 1];
            return siblingID;
        }
    }

}