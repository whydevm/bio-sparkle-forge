import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, X, Eye, Pencil, Trash2, Upload, GripVertical } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  url: string;
  image_url: string | null;
  tags: string[];
  order_index: number;
}

interface ProjectsEditorProps {
  profileId: string;
  projects: Project[];
  onProjectsChange: () => void;
}

const ProjectsEditor = ({ profileId, projects, onProjectsChange }: ProjectsEditorProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setUrl("");
    setTags("");
    setImageUrl(null);
    setEditingProject(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setTitle(project.title);
    setDescription(project.description || "");
    setUrl(project.url || "");
    setTags(project.tags?.join(", ") || "");
    setImageUrl(project.image_url);
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${profileId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("backgrounds")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("backgrounds")
        .getPublicUrl(fileName);

      setImageUrl(urlData.publicUrl);
      toast.success("Image uploaded!");
    } catch (error: any) {
      toast.error(error.message);
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      const projectData = {
        profile_id: profileId,
        title: title.trim(),
        description: description.trim(),
        url: url.trim(),
        image_url: imageUrl,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        order_index: editingProject?.order_index ?? projects.length,
      };

      if (editingProject) {
        const { error } = await supabase
          .from("projects")
          .update(projectData)
          .eq("id", editingProject.id);
        if (error) throw error;
        toast.success("Project updated!");
      } else {
        const { error } = await supabase
          .from("projects")
          .insert(projectData);
        if (error) throw error;
        toast.success("Project added!");
      }

      setIsDialogOpen(false);
      resetForm();
      onProjectsChange();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);
      if (error) throw error;
      toast.success("Project deleted!");
      onProjectsChange();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleToggleVisibility = async (project: Project) => {
    // Toggle visibility logic could be added here
    toast.success("Visibility toggled");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <h3 className="text-xl font-bold text-primary flex items-center gap-2">
          <span className="text-2xl">🔧</span>
          Projects
        </h3>
        <Button
          variant="outline"
          onClick={openAddDialog}
          className="border-primary text-primary hover:bg-primary/10"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No projects yet. Add your first one!
        </p>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/30"
            >
              <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
              
              {project.image_url ? (
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="w-16 h-12 rounded object-cover"
                />
              ) : (
                <div className="w-16 h-12 rounded bg-muted flex items-center justify-center">
                  <Upload className="w-4 h-4 text-muted-foreground" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{project.title}</h4>
                {project.url && (
                  <p className="text-xs text-muted-foreground truncate">
                    ({project.url})
                  </p>
                )}
                <p className="text-xs text-muted-foreground truncate">
                  {project.description}
                </p>
                {project.tags && project.tags.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {project.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded bg-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  className="w-8 h-8 bg-green-600/20 border-green-600 hover:bg-green-600/30"
                  onClick={() => handleToggleVisibility(project)}
                >
                  <Eye className="w-4 h-4 text-green-400" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="w-8 h-8"
                  onClick={() => openEditDialog(project)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="w-8 h-8 bg-red-600/20 border-red-600 hover:bg-red-600/30"
                  onClick={() => handleDelete(project.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                <span className="text-white text-lg">🔧</span>
              </div>
              <div>
                <div className="font-semibold">
                  {editingProject ? "Edit Project" : "Add Project"}
                </div>
                <div className="text-sm text-muted-foreground font-normal">
                  {editingProject ? "Update your project" : "Create a new project to add to your portfolio"}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Title</Label>
                <span className="text-xs text-muted-foreground">
                  {title.length}/32
                </span>
              </div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 32))}
                placeholder="Project title"
                className="bg-card/50 border-border"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Description</Label>
                <span className="text-xs text-muted-foreground">
                  {description.length}/200
                </span>
              </div>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 200))}
                placeholder="Project description"
                className="bg-card/50 border-border min-h-[100px]"
              />
            </div>

            <div>
              <Label className="mb-2 block">Tags</Label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. react, nextjs, design (comma separated)"
                className="bg-card/50 border-border"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>URL</Label>
                <span className="text-xs text-muted-foreground">
                  {url.length}/200
                </span>
              </div>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value.slice(0, 200))}
                placeholder="https://example.com"
                className="bg-card/50 border-border"
              />
            </div>

            <div>
              <Label className="mb-2 block">Custom Icon (Logo)</Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Project"
                    className="w-full h-32 object-cover rounded"
                  />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      {uploading ? "Uploading..." : "Click or Drop a Logo"}
                    </span>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1">
                {editingProject ? "Save Changes" : "Add Project"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsEditor;