import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  ArrowLeft, User, Mail, Phone, BookOpen, GraduationCap,
  Building2, Award, ExternalLink, Camera, Save, Lock,
  Eye, EyeOff, Check, X, Loader2
} from "lucide-react";

export default function TeacherProfile() {
  const sessionToken = localStorage.getItem("teacherSessionToken") || "";
  
  // Profile data
  const { data: profileData, isLoading, refetch } = trpc.teacherAuth.getProfile.useQuery(
    { sessionToken },
    { enabled: !!sessionToken }
  );
  
  // Form state
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    bio: "",
    specialty: "",
    lattesUrl: "",
    department: "",
    title: "",
  });
  
  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  
  // Photo upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Mutations
  const updateProfile = trpc.teacherAuth.updateProfile.useMutation();
  const changePassword = trpc.teacherAuth.changePassword.useMutation();
  const uploadPhoto = trpc.teacherAuth.uploadPhoto.useMutation();
  
  // Populate form when profile loads
  useEffect(() => {
    if (profileData?.profile) {
      const p = profileData.profile;
      setForm({
        name: p.name || "",
        phone: p.phone || "",
        bio: p.bio || "",
        specialty: p.specialty || "",
        lattesUrl: p.lattesUrl || "",
        department: p.department || "",
        title: p.title || "",
      });
    }
  }, [profileData]);
  
  // Redirect if not authenticated
  if (!sessionToken) {
    window.location.href = "/professor/login";
    return null;
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const profile = profileData?.profile;
  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Perfil não encontrado</p>
          <Link href="/admin/professor" className="text-primary hover:underline">Voltar ao painel</Link>
        </div>
      </div>
    );
  }
  
  const handleSave = async () => {
    const result = await updateProfile.mutateAsync({
      sessionToken,
      name: form.name || undefined,
      phone: form.phone || null,
      bio: form.bio || null,
      specialty: form.specialty || null,
      lattesUrl: form.lattesUrl || null,
      department: form.department || null,
      title: form.title || null,
    });
    
    if (result.success) {
      toast.success("Perfil atualizado com sucesso!");
      setEditing(false);
      refetch();
      // Update localStorage name if changed
      if (form.name) localStorage.setItem("teacherName", form.name);
    } else {
      toast.error(result.message);
    }
  };
  
  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres");
      return;
    }
    
    const result = await changePassword.mutateAsync({
      sessionToken,
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
    
    if (result.success) {
      toast.success("Senha alterada com sucesso!");
      setShowPasswordForm(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      toast.error(result.message);
    }
  };
  
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem válida");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }
    
    setUploadingPhoto(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const result = await uploadPhoto.mutateAsync({
          sessionToken,
          photoData: base64,
          mimeType: file.type,
        });
        
        if (result.success) {
          toast.success("Foto atualizada!");
          refetch();
        } else {
          toast.error(result.message);
        }
        setUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Erro ao enviar foto");
      setUploadingPhoto(false);
    }
  };
  
  const passwordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };
  
  const strengthLabel = (score: number) => {
    if (score <= 1) return { text: "Fraca", color: "bg-red-500" };
    if (score <= 2) return { text: "Razoável", color: "bg-amber-500" };
    if (score <= 3) return { text: "Boa", color: "bg-emerald-500" };
    return { text: "Forte", color: "bg-green-400" };
  };

  const pwStrength = passwordStrength(passwordForm.newPassword);
  const pwLabel = strengthLabel(pwStrength);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
        <div className="container py-4 sm:py-6">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/admin/professor">
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft size={16} />
                Voltar ao Painel
              </button>
            </Link>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Photo */}
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-primary/30 bg-secondary flex items-center justify-center">
                {profile.photoUrl ? (
                  <img src={profile.photoUrl} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={36} className="text-muted-foreground" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              >
                {uploadingPhoto ? (
                  <Loader2 size={20} className="text-white animate-spin" />
                ) : (
                  <Camera size={20} className="text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            
            {/* Name & Role */}
            <div className="flex-1 min-w-0">
              <h1 className="font-display font-bold text-xl sm:text-2xl text-foreground truncate">
                {profile.name}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">
                  {profile.role === "super_admin" ? "Super Admin" : profile.role}
                </span>
                {profile.title && (
                  <span className="text-xs text-muted-foreground">{profile.title}</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1 truncate">{profile.email}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="container py-6 sm:py-8 max-w-3xl">
        {/* Profile Info Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <User size={20} className="text-primary" />
              Informações Pessoais
            </h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Editar Perfil
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditing(false); if (profileData?.profile) { const p = profileData.profile; setForm({ name: p.name || "", phone: p.phone || "", bio: p.bio || "", specialty: p.specialty || "", lattesUrl: p.lattesUrl || "", department: p.department || "", title: p.title || "" }); } }}
                  className="text-sm px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={14} className="inline mr-1" />
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateProfile.isPending}
                  className="text-sm px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {updateProfile.isPending ? (
                    <Loader2 size={14} className="inline mr-1 animate-spin" />
                  ) : (
                    <Save size={14} className="inline mr-1" />
                  )}
                  Salvar
                </button>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {/* Name */}
            <ProfileField
              icon={<User size={16} />}
              label="Nome Completo"
              value={profile.name}
              editing={editing}
              editValue={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              required
            />
            
            {/* Email (read-only) */}
            <ProfileField
              icon={<Mail size={16} />}
              label="Email Institucional"
              value={profile.email}
              editing={false}
              readOnly
              hint="O email não pode ser alterado"
            />
            
            {/* Title */}
            <ProfileField
              icon={<Award size={16} />}
              label="Título Acadêmico"
              value={profile.title}
              editing={editing}
              editValue={form.title}
              onChange={(v) => setForm({ ...form, title: v })}
              placeholder="Ex: Dr., Prof. Dr., Me."
            />
            
            {/* Department */}
            <ProfileField
              icon={<Building2 size={16} />}
              label="Departamento"
              value={profile.department}
              editing={editing}
              editValue={form.department}
              onChange={(v) => setForm({ ...form, department: v })}
              placeholder="Ex: Departamento de Farmacologia"
            />
            
            {/* Specialty */}
            <ProfileField
              icon={<GraduationCap size={16} />}
              label="Área de Especialidade"
              value={profile.specialty}
              editing={editing}
              editValue={form.specialty}
              onChange={(v) => setForm({ ...form, specialty: v })}
              placeholder="Ex: Farmacologia Cardiovascular"
            />
            
            {/* Phone */}
            <ProfileField
              icon={<Phone size={16} />}
              label="Telefone"
              value={profile.phone}
              editing={editing}
              editValue={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
              placeholder="(21) 99999-9999"
            />
            
            {/* Lattes */}
            <ProfileField
              icon={<ExternalLink size={16} />}
              label="Currículo Lattes"
              value={profile.lattesUrl}
              editing={editing}
              editValue={form.lattesUrl}
              onChange={(v) => setForm({ ...form, lattesUrl: v })}
              placeholder="http://lattes.cnpq.br/..."
              isLink
            />
            
            {/* Bio */}
            <div className="border border-border rounded-lg p-4" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={16} className="text-primary" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Biografia / Sobre</span>
              </div>
              {editing ? (
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Conte um pouco sobre sua trajetória acadêmica e interesses de pesquisa..."
                  className="w-full bg-secondary/50 border border-border rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  rows={4}
                  maxLength={2000}
                />
              ) : (
                <p className="text-sm text-foreground">
                  {profile.bio || <span className="text-muted-foreground italic">Nenhuma biografia adicionada</span>}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Account Info */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
            <Lock size={20} className="text-primary" />
            Segurança da Conta
          </h2>
          
          <div className="border border-border rounded-lg p-4" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Senha</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Última alteração: {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("pt-BR") : "—"}
                </p>
              </div>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="text-sm px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              >
                Alterar Senha
              </button>
            </div>
            
            {showPasswordForm && (
              <div className="mt-4 pt-4 border-t border-border space-y-3">
                {/* Current Password */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Senha Atual</label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground pr-10 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Digite sua senha atual"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                
                {/* New Password */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Nova Senha</label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground pr-10 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordForm.newPassword && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              i <= pwStrength ? pwLabel.color : "bg-secondary"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">Força: {pwLabel.text}</span>
                    </div>
                  )}
                </div>
                
                {/* Confirm Password */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Confirmar Nova Senha</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground pr-10 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Repita a nova senha"
                    />
                    {passwordForm.confirmPassword && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        {passwordForm.confirmPassword === passwordForm.newPassword ? (
                          <Check size={16} className="text-emerald-500" />
                        ) : (
                          <X size={16} className="text-red-500" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => { setShowPasswordForm(false); setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); }}
                    className="text-sm px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handlePasswordChange}
                    disabled={changePassword.isPending || !passwordForm.currentPassword || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
                    className="text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {changePassword.isPending ? (
                      <Loader2 size={14} className="inline mr-1 animate-spin" />
                    ) : (
                      <Lock size={14} className="inline mr-1" />
                    )}
                    Alterar Senha
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Account metadata */}
        <div className="text-xs text-muted-foreground space-y-1 pb-8">
          <p>Conta criada em: {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }) : "—"}</p>
          <p>Último acesso: {profile.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}</p>
        </div>
      </div>
    </div>
  );
}

// Reusable profile field component
function ProfileField({
  icon,
  label,
  value,
  editing,
  editValue,
  onChange,
  placeholder,
  readOnly,
  hint,
  isLink,
  required,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
  editing: boolean;
  editValue?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  hint?: string;
  isLink?: boolean;
  required?: boolean;
}) {
  return (
    <div className="border border-border rounded-lg p-4" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-primary">{icon}</span>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
        {required && editing && <span className="text-red-400 text-xs">*</span>}
      </div>
      {editing && !readOnly ? (
        <input
          type="text"
          value={editValue || ""}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      ) : (
        <div>
          {value ? (
            isLink ? (
              <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">
                {value}
              </a>
            ) : (
              <p className="text-sm text-foreground">{value}</p>
            )
          ) : (
            <p className="text-sm text-muted-foreground italic">Não informado</p>
          )}
          {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
        </div>
      )}
    </div>
  );
}
